"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "./ui/button";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Cart item type based on your SQL schema
interface CartItem {
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
}

const CART_STORAGE_KEY = "cartItems";
const CHECKOUT_SNAPSHOT_KEY = "cartCheckoutSnapshot";
const FALLBACK_IMAGE = "/product/mock-image-1.webp";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

const CartSheet = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const persistCart = useCallback((items: CartItem[]) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cartChange"));
  }, []);

  const syncCartFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);

      if (!raw) {
        setCartItems([]);
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        setCartItems([]);
        return;
      }

      const normalized: CartItem[] = parsed
        .map((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const productOptionId = Number((item as any).productOptionId);

          if (!Number.isFinite(productOptionId)) {
            return null;
          }

          const stockValue = Number((item as any).stock);
          const maxStock =
            Number.isFinite(stockValue) && stockValue > 0
              ? stockValue
              : Number.MAX_SAFE_INTEGER;

          const quantityValue = Number((item as any).quantity);

          return {
            id: String(
              (item as any).id ??
                `${(item as any).productId ?? "item"}-${productOptionId}`
            ),
            productId: Number((item as any).productId) || productOptionId,
            productOptionId,
            productName: String((item as any).productName ?? "Product"),
            color: String((item as any).color ?? ""),
            size: String((item as any).size ?? ""),
            price: Number((item as any).price) || 0,
            discountPercentage: Number(
              (item as any).discountPercentage
            ) || 0,
            imageUrl: String(
              (item as any).imageUrl ?? FALLBACK_IMAGE
            ),
            quantity: Math.max(
              1,
              Math.min(
                Number.isFinite(quantityValue) ? quantityValue : 1,
                maxStock
              )
            ),
            stock: maxStock,
          };
        })
        .filter(Boolean) as CartItem[];

      setCartItems(normalized);
    } catch (error) {
      console.error("Failed to parse cart from storage", error);
      setCartItems([]);
    }
  }, []);

  useEffect(() => {
    syncCartFromStorage();

    const handleExternalChange = () => {
      syncCartFromStorage();
    };

    window.addEventListener("storage", handleExternalChange);
    window.addEventListener("cartChange", handleExternalChange);

    return () => {
      window.removeEventListener("storage", handleExternalChange);
      window.removeEventListener("cartChange", handleExternalChange);
    };
  }, [syncCartFromStorage]);

  const updateQuantity = useCallback(
    (id: string, newQuantity: number) => {
      setCartItems((prev) => {
        const updated = prev.map((item) => {
          if (item.id !== id) {
            return item;
          }

          const maxQuantity =
            item.stock && Number.isFinite(item.stock)
              ? Math.max(1, item.stock)
              : Number.MAX_SAFE_INTEGER;

          const clamped = Math.max(
            1,
            Math.min(newQuantity, maxQuantity)
          );

          return { ...item, quantity: clamped };
        });

        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  const removeItem = useCallback(
    (id: string) => {
      setCartItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        persistCart(updated);
        return updated;
      });
    },
    [persistCart]
  );

  const getFinalPrice = (price: number, discountPercentage: number) => {
    return price * (1 - discountPercentage / 100);
  };

  const total = useMemo(() => {
    return cartItems.reduce((runningTotal, item) => {
      const finalPrice = getFinalPrice(item.price, item.discountPercentage);
      return runningTotal + finalPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const itemCount = cartItems.length;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      return;
    }

    // Save cart snapshot for checkout page
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        CHECKOUT_SNAPSHOT_KEY,
        JSON.stringify(cartItems)
      );
    }

    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="relative">
          <ShoppingBag />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 flex flex-col w-full sm:max-w-lg" hideCloseButton={true}>
        {/* Fixed Header */}
        <SheetHeader className="border-b px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">
              Shopping Cart ({itemCount})
            </SheetTitle>
            <SheetClose asChild>
              <Button variant="outline" size="icon-lg" className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-600">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-2">
                Add some items to get started
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-6">
              {cartItems.map((item) => {
                const finalPrice = getFinalPrice(
                  item.price,
                  item.discountPercentage
                );

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-neutral-50 rounded-lg relative"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-3 right-3 p-1 hover:bg-white rounded-full transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4 text-gray-500" />
                    </button>

                    {/* Product Image */}
                    <div className="w-24 h-24 bg-neutral-200 rounded-md overflow-hidden shrink-0">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-base mb-1">
                          {item.productName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.color} · Size {item.size}
                        </p>
                      </div>

                      {/* Price and Quantity */}
                      <div className="flex items-end justify-between mt-2">
                        <div className="flex gap-2 items-baseline">
                          {item.discountPercentage > 0 ? (
                            <>
                              <span className="text-base font-bold">
                                S${finalPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                S${item.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-bold">
                              S${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 border border-gray-300 rounded-full px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-medium min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="text-gray-600 hover:text-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={
                              Number.isFinite(item.stock) &&
                              item.stock > 0 &&
                              item.quantity >= item.stock
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fixed Footer */}
        {cartItems.length > 0 && (
          <SheetFooter className="border-t px-6 py-4 shrink-0">
            <div className="w-full space-y-4">
              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">
                  S${total.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleCheckout}
              >
                CHECKOUT
              </Button>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
