"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Minus, Plus, Home, Package, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Mock product data based on SQL schema
const mockProduct = {
  id: 1,
  name: "BRIDGE AUBERGINE",
  description: "The Bridge is a classic sneaker with a modern twist. Featuring premium suede and a comfortable fit, it's perfect for everyday wear.",
  materials: "Upper: Premium suede leather\nLining: Textile\nSole: Natural rubber\nInsole: EVA foam",
  sex: "unisex",
  type: "casual",
  colors: [
    {
      id: 1,
      color: "Aubergine",
      image_url: `${BASE_PATH}/product/mock-image-1.webp`,
      image_url_2: `${BASE_PATH}/product/mock-image-2.webp`,
      options: [
        { id: 1, size: "35", price: 160, discount_percentage: 0, stock: 3 },
        { id: 2, size: "36", price: 160, discount_percentage: 0, stock: 5 },
        { id: 3, size: "37", price: 160, discount_percentage: 0, stock: 2 },
        { id: 4, size: "38", price: 160, discount_percentage: 0, stock: 4 },
        { id: 5, size: "39", price: 160, discount_percentage: 0, stock: 6 },
        { id: 6, size: "40", price: 160, discount_percentage: 0, stock: 1 },
        { id: 7, size: "41", price: 160, discount_percentage: 0, stock: 3 },
        { id: 8, size: "42", price: 160, discount_percentage: 0, stock: 0 },
      ],
    },
    {
      id: 2,
      color: "Red",
      image_url: `${BASE_PATH}/product/mock-image-1.webp`,
      image_url_2: `${BASE_PATH}/product/mock-image-2.webp`,
      options: [
        { id: 9, size: "35", price: 160, discount_percentage: 0, stock: 5 },
        { id: 10, size: "36", price: 160, discount_percentage: 0, stock: 4 },
        { id: 11, size: "37", price: 160, discount_percentage: 0, stock: 3 },
        { id: 12, size: "38", price: 160, discount_percentage: 0, stock: 2 },
      ],
    },
    {
      id: 3,
      color: "Brown",
      image_url: `${BASE_PATH}/product/mock-image-1.webp`,
      image_url_2: `${BASE_PATH}/product/mock-image-2.webp`,
      options: [
        { id: 13, size: "35", price: 160, discount_percentage: 0, stock: 4 },
        { id: 14, size: "36", price: 160, discount_percentage: 0, stock: 3 },
      ],
    },
    {
      id: 4,
      color: "Cream",
      image_url: `${BASE_PATH}/product/mock-image-1.webp`,
      image_url_2: `${BASE_PATH}/product/mock-image-2.webp`,
      options: [
        { id: 15, size: "35", price: 160, discount_percentage: 0, stock: 6 },
        { id: 16, size: "36", price: 160, discount_percentage: 0, stock: 5 },
      ],
    },
  ],
};

// Mock recommended products
const recommendedProducts = [
  {
    id: 2,
    name: "RUNNER BLUE",
    price: 150,
    discount: 10,
    image: [`${BASE_PATH}/product/mock-image-1.webp`, `${BASE_PATH}/product/mock-image-2.webp`],
    sizes: ["35", "36", "37", "38", "39", "40"],
  },
  {
    id: 3,
    name: "CLASSIC WHITE",
    price: 140,
    discount: 0,
    image: [`${BASE_PATH}/product/mock-image-2.webp`, `${BASE_PATH}/product/mock-image-1.webp`],
    sizes: ["36", "37", "38", "39", "40", "41"],
  },
  {
    id: 4,
    name: "URBAN BLACK",
    price: 170,
    discount: 15,
    image: [`${BASE_PATH}/product/mock-image-1.webp`, `${BASE_PATH}/product/mock-image-2.webp`],
    sizes: ["35", "36", "37", "38", "39"],
  },
  {
    id: 5,
    name: "SPORT GREY",
    price: 155,
    discount: 0,
    image: [`${BASE_PATH}/product/mock-image-2.webp`, `${BASE_PATH}/product/mock-image-1.webp`],
    sizes: ["37", "38", "39", "40", "41", "42"],
  },
];

export default function ProductDetailsPage() {
  const [selectedColorId, setSelectedColorId] = useState(mockProduct.colors[0].id);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const selectedColor = mockProduct.colors.find((c) => c.id === selectedColorId);
  const selectedOption = selectedColor?.options.find((o) => o.size === selectedSize);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddToCart = () => {
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
    alert(`Added ${quantity} item(s) to cart`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Product Section */}
      <div className="max-w-[1920px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-0">
          {/* Left Side - Images */}
          <div className="flex flex-col">
            <div className="relative w-full aspect-4/5">
              <Image
                src={selectedColor?.image_url || ""}
                alt={mockProduct.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="relative w-full aspect-4/5">
              <Image
                src={selectedColor?.image_url_2 || ""}
                alt={`${mockProduct.name} detail`}
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
                <Link href="/products" className="hover:text-black transition-colors">
                  Products
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-black font-medium">{mockProduct.name}</span>
              </div>

              {/* Product Title & Price */}
              <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>
              <p className="text-2xl font-bold mb-8">
                S${selectedOption?.price || mockProduct.colors[0].options[0].price}
              </p>

              {/* Color Selector */}
              <div className="mb-6">
                <div className="flex gap-3">
                  {mockProduct.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => {
                        setSelectedColorId(color.id);
                        setSelectedSize("");
                      }}
                      className={`relative w-16 h-16 rounded border-2 overflow-hidden transition-colors ${
                        selectedColorId === color.id
                          ? "border-black"
                          : "border-gray-300"
                      }`}
                    >
                      <Image
                        src={color.image_url}
                        alt={color.color}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Talla</Label>
                  <div className="text-xs text-gray-600">EU</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedColor?.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedSize(option.size)}
                      disabled={option.stock === 0}
                      className={`px-4 py-2 border rounded transition-colors ${
                        selectedSize === option.size
                          ? "bg-black text-white border-black"
                          : option.stock === 0
                          ? "border-gray-200 text-gray-300 cursor-not-allowed"
                          : "border-gray-300 hover:border-black"
                      }`}
                    >
                      {option.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Warning */}
              {selectedOption && selectedOption.stock > 0 && selectedOption.stock <= 5 && (
                <p className="text-sm font-medium mb-6">Few units available</p>
              )}

              {/* Quantity Selector */}
              {selectedSize && selectedOption && selectedOption.stock > 0 && (
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">Quantity</Label>
                  <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-medium min-w-[30px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(selectedOption.stock, quantity + 1))
                      }
                      disabled={quantity >= selectedOption.stock}
                      className="text-gray-600 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!selectedSize || !selectedOption || selectedOption.stock === 0}
                >
                  ADD TO CART
                </Button>
                {/* <Button size="lg" variant="outline" className="w-full">
                  TO STYLE WITH
                </Button> */}
              </div>

              {/* Promo Banner */}
              <div className="bg-yellow-200 p-4 rounded-lg mb-6 text-center">
                <p className="text-sm font-medium">
                  10% off your first order.{" "}
                  <Link href="/signup" className="underline">
                    Sign up here
                  </Link>
                  .
                </p>
              </div>

              {/* Product Info */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm">
                  <Home className="w-5 h-5" />
                  <span>
                    Free shipping
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Package className="w-5 h-5" />
                  <span>
                    Returns within 30 calendar days
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-5 h-5" />
                  <span>Secure payment</span>
                </div>
              </div>

              {/* Accordion Sections */}
              <div className="border-t">
                {/* Description */}
                <button
                  onClick={() => toggleSection("description")}
                  className="flex items-center justify-between w-full py-4 border-b"
                >
                  <span className="font-medium">Description</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedSection === "description" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSection === "description" && (
                  <div className="py-4 text-sm text-gray-700 border-b">
                    {mockProduct.description}
                  </div>
                )}

                {/* Materials */}
                <button
                  onClick={() => toggleSection("materials")}
                  className="flex items-center justify-between w-full py-4 border-b"
                >
                  <span className="font-medium">Materials</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedSection === "materials" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSection === "materials" && (
                  <div className="py-4 text-sm text-gray-700 border-b whitespace-pre-line">
                    {mockProduct.materials}
                  </div>
                )}

                {/* Size Guide */}
                <button
                  onClick={() => toggleSection("size-guide")}
                  className="flex items-center justify-between w-full py-4"
                >
                  <span className="font-medium">Size guide</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${
                      expandedSection === "size-guide" ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {expandedSection === "size-guide" && (
                  <div className="py-4 text-sm text-gray-700">
                    <p className="mb-2">EU sizing guide:</p>
                    <ul className="space-y-1">
                      <li>35 = 22.5 cm</li>
                      <li>36 = 23 cm</li>
                      <li>37 = 23.5 cm</li>
                      <li>38 = 24 cm</li>
                      <li>39 = 24.5 cm</li>
                      <li>40 = 25 cm</li>
                      <li>41 = 25.5 cm</li>
                      <li>42 = 26 cm</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Products Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 lg:px-12">
        <h2 className="text-2xl font-bold mb-8">Other Shoes You May Like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              discount={product.discount}
              image={product.image[0]}
              image2={product.image[1]}
              sizes={product.sizes}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Label component (inline for simplicity)
function Label({
  children,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
