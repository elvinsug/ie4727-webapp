"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { ShoppingBag } from "lucide-react";

interface ProductCardProps {
  id: number;
  image: string[];
  name: string;
  price: number;
  discount: number;
  sizes: string[];
  //   type: string;
  //   size: string;
  //   material: string;
  //   sex: string;
  //   isNew: boolean;
  //   isSale: boolean;
}

const ProductCard = ({
  id,
  image,
  name,
  price,
  discount,
  sizes,
}: //   type,
//   size,
//   material,
//   sex,
//   isNew,
//   isSale,
ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const handleSizeClick = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size first");
      return;
    }

    // TODO: Add to cart logic
    console.log(
      `Adding to cart: ${name}, Size: ${selectedSize}, Price: ${price}`
    );
    alert(`Added ${name} (Size: ${selectedSize}) to cart!`);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col gap-3 cursor-pointer"
    >
      <div className="relative w-full aspect-10/12">
        <Link className="w-full h-auto" href={`/products/${id}`}>
          <img
            src={image[0]}
            alt={name}
            className={`w-full h-auto object-cover ${
              isHovered ? "opacity-0" : "opacity-100"
            } ease-in duration-200 absolute z-10 inset-0`}
          />
        </Link>
        <Link className="w-full h-auto" href={`/products/${id}`}>
          <img
            src={image[1]}
            alt={name}
            className="w-full h-auto object-cover"
          />
        </Link>
        {/* Sizes */}
        {isHovered && (
          <div className="flex px-3 items-center justify-between absolute inset-x-0 bottom-3 z-20">
            <div className="flex items-center gap-1">
              {sizes.sort().map((size) => (
                <Button
                  key={size}
                  variant={selectedSize === size ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full font-thin text-xs"
                  onClick={() => handleSizeClick(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
            <Button variant={"outline"} onClick={handleAddToCart}>
              <ShoppingBag className="w-4 h-4" /> Add
            </Button>
          </div>
        )}
      </div>
      <Link href={`/products/${id}`} className="flex flex-col font-medium">
        <h6 className="font-display font-medium text-lg uppercase">{name}</h6>
        <div className="flex gap-2 items-center">
          <h6 className={`${discount > 0 ? "line-through" : ""}`}>S${price}</h6>
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
  );
};

export default ProductCard;
