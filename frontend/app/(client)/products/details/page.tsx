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
import { useSearchParams } from "next/navigation";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";
const CART_STORAGE_KEY = "cartItems";

type ProductOption = {
  id: number;
  size: string;
  price: number;
  discount_percentage: number;
  stock: number;
};

const ProductDetailsPage = () => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading product...</p>
      </div>
    }
  >
    <DetailsContent />
  </Suspense>
);

export default ProductDetailsPage;

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

type CartStorageItem = {
  id: string;
  productId: number;
  productOptionId: number;
  productName: string;
  color: string;
  size: string;
  price: number;
  discountPercentage: number;
  imageUrl: string;
  quantity: number;
  stock: number;
};

const recommendedProducts = [
  {
    id: 2,
    name: "RUNNER BLUE",
    price: 150,
    discount: 10,
    image: [
      `${BASE_PATH}/product/mock-image-1.webp`,
      `${BASE_PATH}/product/mock-image-2.webp`,
    ],
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
  {
    id: 3,
    name: "CLASSIC WHITE",
    price: 140,
    discount: 0,
    image: [
      `${BASE_PATH}/product/mock-image-2.webp`,
      `${BASE_PATH}/product/mock-image-1.webp`,
    ],
    sizes: ["36", "37", "38", "39", "40", "41"],
  },
  {
    id: 4,
    name: "URBAN BLACK",
    price: 170,
    discount: 15,
    image: [
      `${BASE_PATH}/product/mock-image-1.webp`,
      `${BASE_PATH}/product/mock-image-2.webp`,
    ],
    sizes: ["35", "36", "37", "38", "39"],
  },
  {
    id: 5,
    name: "SPORT GREY",
    price: 155,
    discount: 0,
    image: [
      `${BASE_PATH}/product/mock-image-2.webp`,
      `${BASE_PATH}/product/mock-image-1.webp`,
    ],
    sizes: ["37", "38", "39", "40", "41", "42"],
  },
];

function DetailsContent() {
  const searchParams = useSearchParams();
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
      try {
        if (!productId) {
          if (isMounted) {
            setProduct(null);
            setSelectedColorId(null);
            setSelectedSize("");
            setError("Product not found");
            setIsLoading(false);
          }
          return;
        }

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

    const activeColorId =
      selectedColorId ?? product.colors[0]?.id ?? null;
    const selectedColor =
      product.colors.find((color) => color.id === activeColorId) ??
      product.colors[0];
    const selectedOption = selectedColor?.options?.find(
      (option) => option.size === selectedSize
    );

    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    if (!selectedOption || selectedOption.stock === 0) {
      alert("This size is out of stock");
      return;
    }
    if (quantity > selectedOption.stock) {
      alert(`Only ${selectedOption.stock} items available`);
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const fallbackImage =
      selectedColor?.image_url ||
      selectedColor?.image_url_2 ||
      `${BASE_PATH}/product/mock-image-1.webp`;

    const cartItem: CartStorageItem = {
      id: `${product.id}-${selectedOption.id}`,
      productId: product.id,
      productOptionId: selectedOption.id,
      productName: product.name,
      color: selectedColor?.color ?? "",
      size: selectedOption.size,
      price: selectedOption.price,
      discountPercentage: selectedOption.discount_percentage,
      imageUrl: fallbackImage,
      quantity,
      stock: selectedOption.stock,
    };

    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      let existingData: unknown = [];

      if (raw) {
        try {
          existingData = JSON.parse(raw);
        } catch (parseError) {
          existingData = [];
        }
      }

      const existing = Array.isArray(existingData)
        ? (existingData as CartStorageItem[])
        : [];

      let updatedCart: CartStorageItem[] = [];
      let cappedQuantity = false;

      if (existing.length > 0) {
        let found = false;
        updatedCart = existing.map((item) => {
          if (
            item &&
            typeof item === "object" &&
            item.productOptionId === cartItem.productOptionId
          ) {
            found = true;
            const previousQuantity = item.quantity ?? 0;
            const combinedQuantity = Math.min(
              previousQuantity + quantity,
              cartItem.stock
            );

            if (combinedQuantity === previousQuantity) {
              cappedQuantity = true;
            }

            return {
              ...item,
              quantity: combinedQuantity,
              stock: cartItem.stock,
              price: cartItem.price,
              discountPercentage: cartItem.discountPercentage,
              imageUrl: cartItem.imageUrl,
              productName: cartItem.productName,
              color: cartItem.color,
              size: cartItem.size,
            };
          }
          return item as CartStorageItem;
        });

        if (!found) {
          updatedCart = [...existing, cartItem];
        }
      } else {
        updatedCart = [cartItem];
      }

      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(updatedCart)
      );
      window.dispatchEvent(new Event("cartChange"));

      if (cappedQuantity) {
        alert("You have reached the maximum available stock for this item.");
      } else {
        alert(`Added ${quantity} item(s) to cart`);
      }

      setQuantity(1);
    } catch (storageError) {
      console.error("Failed to update cart", storageError);
      alert("Unable to add item to cart at this time.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-600">Loading product details...</p>
      </div>
    );
  }

  if (error || !product || product.colors.length === 0) {
    return (
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
  );
}
