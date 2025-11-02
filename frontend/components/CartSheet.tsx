"use client";

import { useState } from "react";
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
import Link from "next/link";

// Cart item type based on your SQL schema
interface CartItem {
  id: string;
  productId: number;
  productName: string;
  color: string;
  size: string;
  price: number;
  discountPercentage: number;
  imageUrl: string;
  quantity: number;
}

// Mock cart data
const mockCartItems: CartItem[] = [
  {
    id: "cart-1",
    productId: 1,
    productName: "BRIDGE BLUE",
    color: "Light Blue",
    size: "35",
    price: 140.0,
    discountPercentage: 0,
    imageUrl: "/product/mock-image-1.webp",
    quantity: 1,
  },
  {
    id: "cart-2",
    productId: 2,
    productName: "SUNSET RUNNER",
    color: "Orange",
    size: "38",
    price: 165.0,
    discountPercentage: 15,
    imageUrl: "/product/mock-image-2.webp",
    quantity: 2,
  },
  {
    id: "cart-3",
    productId: 3,
    productName: "URBAN STRIDE",
    color: "Black",
    size: "40",
    price: 180.0,
    discountPercentage: 10,
    imageUrl: "/product/mock-image-1.webp",
    quantity: 1,
  },
];

const CartSheet = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [isOpen, setIsOpen] = useState(false);

  // Update quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCartItems(
      cartItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  // Calculate final price after discount
  const getFinalPrice = (price: number, discountPercentage: number) => {
    return price * (1 - discountPercentage / 100);
  };

  // Calculate total
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const finalPrice = getFinalPrice(item.price, item.discountPercentage);
      return total + finalPrice * item.quantity;
    }, 0);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="relative">
          <ShoppingBag />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="p-0 flex flex-col w-full sm:max-w-lg" hideCloseButton={true}>
        {/* Fixed Header */}
        <SheetHeader className="border-b px-6 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">
              Shopping Cart ({cartItems.length})
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
                            className="text-gray-600 hover:text-black transition-colors"
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
                  S${calculateTotal().toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <Link 
                href="/checkout" 
                className="w-full"
                onClick={() => setIsOpen(false)}
              >
                <Button size="lg" className="w-full">
                  CHECKOUT
                </Button>
              </Link>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;

