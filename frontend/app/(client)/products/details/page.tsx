"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ChevronDown,
  Minus,
  Plus,
  Home,
  Package,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useRouter, useSearchParams } from "next/navigation";
import { useAlertDialog } from "@/hooks/useAlertDialog";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

const CART_STORAGE_KEY = "cartItems";
const CHECKOUT_SNAPSHOT_KEY = "cartCheckoutSnapshot";

type ProductOption = {
  id: number;
  size: string;
  price: number;
  discount_percentage: number;
  stock: number;
};

type ProductColor = {
  id: number;
  color: string;
  image_url: string | null;
  image_url_2: string | null;
  options: ProductOption[];
};

type Product = {
  id: number;
  name: string;
  description: string;
  materials: string | null;
  sex: string;
  type: string;
  colors: ProductColor[];
};

const ProductDetailsContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showAlert, alertDialog } = useAlertDialog();
  const productId = searchParams.get("id");
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchProduct = async () => {
      if (!productId) {
        if (isMounted) {
          setError("Product ID is required");
          setProduct(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/get_product.php?id=${encodeURIComponent(productId)}`,
          {
            method: "GET",
            credentials: "include",
            signal: controller.signal,
          }
        );

        let payload: any = null;

        try {
          payload = await response.json();
        } catch (parseError) {
          payload = null;
        }

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load product");
        }

        if (!payload?.success || !payload.product) {
          throw new Error("Product information is unavailable");
        }

        if (isMounted) {
          const loadedProduct = payload.product as Product;
          setProduct(loadedProduct);
          const firstColor = loadedProduct.colors[0];
          const firstColorId = firstColor?.id ?? null;
          setSelectedColorId(firstColorId);
          setSelectedSize(firstColor?.options?.[0]?.size ?? "");
          setQuantity(1);
          setExpandedSection(null);
        }
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load product"
          );
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [productId]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    const activeColorId = selectedColorId ?? product.colors[0]?.id ?? null;
    const selectedColor =
      product.colors.find((color) => color.id === activeColorId) ??
      product.colors[0];
    const selectedOption = selectedColor?.options?.find(
      (option) => option.size === selectedSize
    );

    if (!selectedSize) {
      showAlert({
        title: "Select Size",
        description: "Please choose a size before adding this item to your cart.",
      });
      return;
    }
    if (!selectedOption || selectedOption.stock === 0) {
      showAlert({
        title: "Out of Stock",
        description: "This size is out of stock.",
      });
      return;
    }
    if (quantity > selectedOption.stock) {
      showAlert({
        title: "Limited Stock",
        description: `Only ${selectedOption.stock} item(s) available for this size.`,
      });
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    let isAuthenticated = false;
    try {
      const rawUser = window.localStorage.getItem("user");
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser);
        if (
          parsedUser &&
          typeof parsedUser === "object" &&
          parsedUser.email
        ) {
          isAuthenticated = true;
        }
      }
    } catch (authError) {
      console.error("Failed to determine authentication state", authError);
    }

    if (!isAuthenticated) {
      showAlert({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        onConfirm: () => router.push("/login"),
      });
      return;
    }

    const normalizedStock = Number(selectedOption.stock);
    const maxStock =
      Number.isFinite(normalizedStock) && normalizedStock > 0
        ? normalizedStock
        : Number.MAX_SAFE_INTEGER;
    const clampedQuantity = Math.max(1, Math.min(quantity, maxStock));

    const cartItem = {
      id: `${product.id}-${selectedColor.id}-${selectedOption.id}`,
      productId: product.id,
      productOptionId: selectedOption.id,
      productName: product.name,
      color: selectedColor?.color ?? "",
      size: selectedOption.size,
      price: selectedOption.price,
      discountPercentage: selectedOption.discount_percentage ?? 0,
      imageUrl:
        selectedColor?.image_url || `${BASE_PATH}/product/mock-image-1.webp`,
      quantity: clampedQuantity,
      stock: maxStock,
    };

    try {
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
      let existing: any[] = [];

      if (rawCart) {
        try {
          const parsed = JSON.parse(rawCart);
          if (Array.isArray(parsed)) {
            existing = parsed;
          }
        } catch (parseError) {
          console.error("Failed to parse existing cart", parseError);
        }
      }

      let found = false;
      const updatedCart = existing
        .map((item) => {
          if (
            item &&
            typeof item === "object" &&
            item.productOptionId === cartItem.productOptionId
          ) {
            found = true;
            const previousQuantity = Number(item.quantity ?? 0);
            const nextQuantity = Math.min(
              previousQuantity + cartItem.quantity,
              cartItem.stock ?? Number.MAX_SAFE_INTEGER
            );

            return {
              ...item,
              quantity: nextQuantity,
              price: cartItem.price,
              discountPercentage: cartItem.discountPercentage,
              imageUrl: cartItem.imageUrl,
              color: cartItem.color,
              productName: cartItem.productName,
              size: cartItem.size,
            };
          }

          return item;
        })
        .filter(Boolean);

      if (!found) {
        updatedCart.push(cartItem);
      }

      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(updatedCart)
      );
      window.localStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
      window.dispatchEvent(new Event("cartChange"));

      showAlert({
        title: "Added to Cart",
        description:
          `Added ${clampedQuantity} item(s) of ${product.name} ` +
          `(Color: ${cartItem.color || "Default"}, Size: ${cartItem.size}) to your cart.`,
      });
      setQuantity(1);
    } catch (storageError) {
      console.error("Failed to update cart", storageError);
      showAlert({
        title: "Error",
        description: "Unable to add item to cart at this time.",
      });
    }
  };

  if (isLoading) {
    return (
      <>
        {alertDialog}
        <LoadingFallback />
      </>
    );
  }

  if (error || !product || product.colors.length === 0) {
    return (
      <>
        {alertDialog}
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold">
              {error || "Product not found"}
            </h1>
            <Link href="/products" className="text-blue-600 underline">
              Back to products
            </Link>
          </div>
        </div>
      </>
    );
  }

  const activeColorId =
    selectedColorId ?? product.colors[0]?.id ?? null;
  const selectedColor =
    product.colors.find((color) => color.id === activeColorId) ??
    product.colors[0];
  const colorOptions = selectedColor?.options ?? [];
  const selectedOption = colorOptions.find(
    (option) => option.size === selectedSize
  );
  const defaultPrice =
    colorOptions[0]?.price ??
    product.colors[0]?.options[0]?.price ??
    0;

  return (
    <>
      {alertDialog}
      <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="max-w-[1920px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side - Images */}
          <div className="flex flex-col">
            <div className="relative w-full aspect-4/5">
              <Image
                src={
                  selectedColor?.image_url ||
                  `${BASE_PATH}/product/mock-image-1.webp`
                }
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative w-full aspect-4/5">
              <Image
                src={
                  selectedColor?.image_url_2 ||
                  `${BASE_PATH}/product/mock-image-2.webp`
                }
                alt={`${product.name} detail`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Right Side - Sticky Product Info */}
          <div className="lg:sticky lg:top-0 lg:self-start">
            <div className="pt-[88px] p-12 max-h-screen overflow-y-auto">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm mb-8 text-gray-600">
                <Link href="/" className="hover:text-black transition-colors">
                  Home
                </Link>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href="/products"
                  className="hover:text-black transition-colors"
                >
                  Products
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black font-medium">{product.name}</span>
              </div>

              {/* Product Title & Price */}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-bold mb-8">
                S${selectedOption?.price ?? defaultPrice}
              </p>

              {/* Color Selector */}
              <div className="mb-6">
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColorId(color.id);
                        setSelectedSize(color.options?.[0]?.size ?? "");
                      }}
                      className={`relative w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                        selectedColorId === color.id
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                    >
                      <Image
                        src={
                          color.image_url ||
                          `${BASE_PATH}/product/mock-image-1.webp`
                        }
                        alt={color.color}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm uppercase tracking-wide text-gray-600">
                    Select Size
                  </p>
                  <Link href="/size-guide" className="text-xs text-gray-500">
                    Size guide
                  </Link>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedSize(option.size)}
                      className={`px-4 py-3 rounded-md border text-sm font-medium transition-colors ${
                        selectedSize === option.size
                          ? "border-black bg-black text-white"
                          : option.stock === 0
                          ? "border-gray-200 text-gray-400 cursor-not-allowed"
                          : "border-gray-200 hover:border-black"
                      }`}
                      disabled={option.stock === 0}
                    >
                      {option.size}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedOption
                    ? `${selectedOption.stock} in stock`
                    : "Select a size to view stock"}
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 border border-gray-200 rounded-lg w-fit px-3 py-2 mb-6">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-semibold w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <Button
                className="w-full h-12 text-md font-semibold"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>

              {/* Product Details */}
              <div className="mt-12 space-y-4">
                <button
                  className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                  onClick={() => toggleSection("description")}
                >
                  <span className="text-sm font-semibold">
                    Product Description
                  </span>
                  {expandedSection === "description" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "description" && (
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {product.description}
                  </div>
                )}

                <button
                  className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                  onClick={() => toggleSection("materials")}
                >
                  <span className="text-sm font-semibold">Materials</span>
                  {expandedSection === "materials" ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedSection === "materials" && (
                  <div className="text-sm text-gray-600 whitespace-pre-line">
                    {product.materials}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="border-y border-gray-200 py-12 mt-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 px-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Home className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-sm text-gray-600">
                Enjoy complimentary shipping and returns within Singapore
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Extended Returns</h3>
              <p className="text-sm text-gray-600">
                30-day returns and exchanges for unworn products
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-gray-900" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">2-Year Warranty</h3>
              <p className="text-sm text-gray-600">
                Quality assured with extended product protection
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products */}
      <div className="py-16">
        <div className="max-w-[1920px] mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recommended for you</h2>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors flex items-center gap-2"
            >
              View all
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-600">Loading product details...</p>
    </div>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProductDetailsContent />
    </Suspense>
  );
}
