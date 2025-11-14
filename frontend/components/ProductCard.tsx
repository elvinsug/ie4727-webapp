"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAlertDialog } from "@/hooks/useAlertDialog";

type ProductOption = {
  id: number;
  size: string;
  price: number;
  discount_percentage?: number;
  stock?: number;
};

interface ProductCardProps {
  id: number;
  image: string;
  image2: string;
  name: string;
  price: number;
  discount: number;
  sizes?: string[];
  options?: ProductOption[];
  color?: string;
}

const ProductCard = ({
  id,
  image,
  image2,
  name,
  price,
  discount,
  options = [],
  color,
  sizes = [],
}: ProductCardProps) => {
  const router = useRouter();
  const { showAlert, alertDialog } = useAlertDialog();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
  };

  const availableOptions = useMemo(() => {
    if (options.length > 0) {
      return options;
    }

    return sizes.map((size) => ({
      id: Number(`${id}-${size}`.replace(/[^0-9]/g, "")) || id,
      size,
      price,
      discount_percentage: discount,
      stock: Number.MAX_SAFE_INTEGER,
    }));
  }, [options, sizes, id, price, discount]);

  const selectedOption = useMemo(() => {
    if (!selectedSize) {
      return null;
    }

    return availableOptions.find(
      (option) => option.size === selectedSize
    ) ?? null;
  }, [availableOptions, selectedSize]);

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) {
      showAlert({
        title: "Select Size",
        description: "Please choose a size before adding this item to your cart.",
      });
      return;
    }

    if (!selectedOption) {
      showAlert({
        title: "Unavailable",
        description: "This size is currently unavailable.",
      });
      return;
    }

    if (selectedOption.stock !== undefined && selectedOption.stock <= 0) {
      showAlert({
        title: "Out of Stock",
        description: "This size is out of stock.",
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

    const CART_STORAGE_KEY = "cartItems";
    const CHECKOUT_SNAPSHOT_KEY = "cartCheckoutSnapshot";

    const cartItem = {
      id: `${id}-${selectedOption.id}`,
      productId: id,
      productOptionId: selectedOption.id,
      productName: name,
      color: color ?? "",
      size: selectedOption.size,
      price: selectedOption.price ?? price,
      discountPercentage: selectedOption.discount_percentage ?? discount ?? 0,
      imageUrl: image,
      quantity: 1,
      stock:
        selectedOption.stock && selectedOption.stock > 0
          ? selectedOption.stock
          : Number.MAX_SAFE_INTEGER,
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
            const maxStock = cartItem.stock ?? Number.MAX_SAFE_INTEGER;
            const nextQuantity = Math.min(previousQuantity + 1, maxStock);
            return {
              ...item,
              quantity: nextQuantity,
              price: cartItem.price,
              discountPercentage: cartItem.discountPercentage,
              imageUrl: cartItem.imageUrl,
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
        description: `Added ${name} (Size: ${selectedOption.size}) to your cart.`,
      });
      setSelectedSize(null);
    } catch (storageError) {
      console.error("Failed to update cart", storageError);
      showAlert({
        title: "Error",
        description: "Unable to add item to cart at this time.",
      });
    }
  }, [
    selectedOption,
    selectedSize,
    id,
    name,
    color,
    image,
    price,
    discount,
    router,
    showAlert,
  ]);

  return (
    <>
      {alertDialog}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex flex-col gap-3 cursor-pointer"
      >
        <div className="relative w-full aspect-10/12">
          <Link className="w-full h-auto" href={`/products/details?id=${id}`}>
            <img
              src={image}
              alt={name}
              className={`w-full h-auto object-cover ${
                isHovered ? "opacity-0" : "opacity-100"
              } ease-in duration-200 absolute z-10 inset-0`}
            />
          </Link>
          <Link className="w-full h-auto" href={`/products/details?id=${id}`}>
            <img
              src={image2}
              alt={name}
              className="w-full h-auto object-cover"
            />
          </Link>
          {/* Sizes */}
          {isHovered && (
            <div className="flex px-3 items-center justify-between absolute inset-x-0 bottom-3 z-20">
              <div className="flex items-center gap-1">
                {availableOptions.map((option) => (
                  <Button
                    key={option.id}
                    variant={
                      selectedSize === option.size ? "default" : "secondary"
                    }
                    size="sm"
                    className="rounded-full font-thin text-xs"
                    onClick={() => handleSizeClick(option.size)}
                  >
                    {option.size}
                  </Button>
                ))}
              </div>
              <Button variant={"outline"} onClick={handleAddToCart}>
                <ShoppingBag className="w-4 h-4" /> Add
              </Button>
            </div>
          )}
        </div>
        <Link
          href={`/products/details?id=${id}`}
          className="flex flex-col font-medium"
        >
          <h6 className="font-display font-medium text-lg uppercase">{name}</h6>
          <div className="flex gap-2 items-center">
            <h6 className={`${discount > 0 ? "line-through" : ""}`}>
              S${price}
            </h6>
            {discount > 0 && (
              <div className="flex items-center gap-1 h-[24px] px-2 bg-blue-100 text-blue-700 font-sm">
                <span>{discount}% off –</span>
                <span className="font-bold">
                  S${(price * (1 - discount / 100)).toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;
