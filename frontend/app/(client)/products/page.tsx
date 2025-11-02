"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import FilterSheet from "@/components/FilterSheet";
import ProductCard from "@/components/ProductCard";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, CircleX } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const SortOptions: { [key: string]: string } = {
  "price-asc": "From cheapest",
  "price-desc": "From most expensive",
  "date-desc": "From latest",
  "date-asc": "From oldest",
};

const ShoeTypes = [
  {
    name: "All Types",
    path: "/products",
  },
  {
    name: "Casual",
    path: "/products?type=casual",
    icon: `${BASE_PATH}/shoes-icon/casual.svg`,
  },
  {
    name: "Track & Field",
    path: "/products?type=track_field",
    icon: `${BASE_PATH}/shoes-icon/track_field.svg`,
  },
  {
    name: "Arch",
    path: "/products?type=arch",
    icon: `${BASE_PATH}/shoes-icon/arch.svg`,
  },
];

const AvailableSizes = [
  {
    name: "All Sizes",
    path: "/products",
  },
  {
    name: "36",
    path: "/products?size=36",
  },
  {
    name: "37",
    path: "/products?size=37",
  },
  {
    name: "38",
    path: "/products?size=38",
  },
  {
    name: "39",
    path: "/products?size=39",
  },
  {
    name: "40",
    path: "/products?size=40",
  },
  {
    name: "41",
    path: "/products?size=41",
  },
  {
    name: "42",
    path: "/products?size=42",
  },
  {
    name: "43",
    path: "/products?size=43",
  },
  {
    name: "44",
    path: "/products?size=44",
  },
  {
    name: "45",
    path: "/products?size=45",
  },
];

const ProductsPageContent = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  // State for selected filters
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>("");

  // Get all available type values (excluding "All Types")
  const allTypeValues = ShoeTypes.filter((t) => t.name !== "All Types").map(
    (t) => t.path.split("=")[1]
  );

  // Get all available size values (excluding "All Sizes")
  const allSizeValues = AvailableSizes.filter(
    (s) => s.name !== "All Sizes"
  ).map((s) => s.path.split("=")[1]);

  // Initialize from URL params
  useEffect(() => {
    const typeParam = searchParams.get("type");
    const sizeParam = searchParams.get("size");
    const sortParam = searchParams.get("sort");

    if (typeParam) {
      setSelectedTypes(typeParam.split(","));
    } else {
      setSelectedTypes([]);
    }

    if (sizeParam) {
      setSelectedSizes(sizeParam.split(","));
    } else {
      setSelectedSizes([]);
    }

    if (sortParam) {
      setSelectedSort(sortParam);
    } else {
      setSelectedSort("");
    }
  }, [searchParams]);

  // Check if all types are selected
  const allTypesSelected =
    selectedTypes.length === allTypeValues.length &&
    allTypeValues.every((type) => selectedTypes.includes(type));

  // Check if all sizes are selected
  const allSizesSelected =
    selectedSizes.length === allSizeValues.length &&
    allSizeValues.every((size) => selectedSizes.includes(size));

  // Toggle type filter
  const toggleType = (typeValue: string | null) => {
    if (typeValue === null) {
      // "All Types" clicked - clear all types
      setSelectedTypes([]);
    } else {
      setSelectedTypes((prev) => {
        if (prev.includes(typeValue)) {
          // Remove the type
          return prev.filter((t) => t !== typeValue);
        } else {
          // Add the type
          return [...prev, typeValue];
        }
      });
    }
  };

  // Toggle size filter
  const toggleSize = (sizeValue: string | null) => {
    if (sizeValue === null) {
      // "All Sizes" clicked - clear all sizes
      setSelectedSizes([]);
    } else {
      setSelectedSizes((prev) => {
        if (prev.includes(sizeValue)) {
          // Remove the size
          return prev.filter((s) => s !== sizeValue);
        } else {
          // Add the size
          return [...prev, sizeValue];
        }
      });
    }
  };

  // Handle sort selection
  const handleSortClick = (sortValue: string) => {
    setSelectedSort(sortValue);
    setIsSortMenuOpen(false);
  };

  // Clear sort
  const clearSort = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSort("");
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    // Handle types
    if (selectedTypes.length > 0) {
      params.set("type", selectedTypes.join(","));
    } else {
      params.delete("type");
    }

    // Handle sizes
    if (selectedSizes.length > 0) {
      params.set("size", selectedSizes.join(","));
    } else {
      params.delete("size");
    }

    // Handle sort
    if (selectedSort) {
      params.set("sort", selectedSort);
    } else {
      params.delete("sort");
    }

    const queryString = params.toString();
    const url = queryString ? `${pathname}?${queryString}` : pathname;
    window.history.pushState({}, "", url);
  }, [selectedTypes, selectedSizes, selectedSort, pathname, searchParams]);

  const products = [
    {
      id: 1,
      image: [
        `${BASE_PATH}/product/mock-image-1.webp`,
        `${BASE_PATH}/product/mock-image-2.webp`,
      ],
      name: "Product 1",
      price: 100,
      discount: 10,
      sizes: ["40", "41", "42"],
    },
    {
      id: 2,
      image: [
        `${BASE_PATH}/product/mock-image-2.webp`,
        `${BASE_PATH}/product/mock-image-1.webp`,
      ],
      name: "Product 2",
      price: 150,
      discount: 0,
      sizes: ["40", "41", "42"],
    },
  ];
  return (
    <div className="mt-[88px] w-screen p-8 pt-4">
      <header className="flex flex-col gap-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Link
            href="/"
            className="hover:text-gray-900 transition-colors duration-100 cursor-pointer"
          >
            MIONA
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-gray-900 transition-colors duration-100 cursor-pointer"
          >
            Sneakers for Men
          </Link>
        </div>
        {/* Page Title */}
        <h1 className="text-3xl font-bold">Sneakers for Men</h1>

        {/* Debug Display */}
        {/* <div className="bg-gray-100 p-4 rounded-lg text-sm space-y-2 mt-2">
          <div>
            <span className="font-semibold">Selected Types:</span>{" "}
            {selectedTypes.length > 0 ? (
              <span className="text-blue-600">[{selectedTypes.join(", ")}]</span>
            ) : (
              <span className="text-gray-400">[]</span>
            )}
            {allTypesSelected && (
              <span className="ml-2 text-green-600 font-semibold">✓ All Types Selected</span>
            )}
          </div>
          <div>
            <span className="font-semibold">Selected Sizes:</span>{" "}
            {selectedSizes.length > 0 ? (
              <span className="text-blue-600">[{selectedSizes.join(", ")}]</span>
            ) : (
              <span className="text-gray-400">[]</span>
            )}
            {allSizesSelected && (
              <span className="ml-2 text-green-600 font-semibold">✓ All Sizes Selected</span>
            )}
          </div>
        </div> */}

        {/* The Filters */}
        <div className="flex flex-col gap-2 mt-3">
          {/* Types Button Chips + Filter */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {ShoeTypes.map((type) => {
                const [path, query] = type.path.split("?");
                const typeValue = query?.split("=")[1];

                // Special case: When all types are selected, only "All Types" is active
                // Individual types are NOT active when all are selected
                let isActive = false;
                if (type.name === "All Types") {
                  // "All Types" is active when no types selected OR all types selected
                  isActive = selectedTypes.length === 0 || allTypesSelected;
                } else {
                  // Individual type is active ONLY if:
                  // - It's in the selection AND
                  // - Not all types are selected
                  isActive =
                    selectedTypes.includes(typeValue) && !allTypesSelected;
                }

                return (
                  <Button
                    key={type.name}
                    variant={isActive ? "default" : "secondary"}
                    className="font-thin flex items-center gap-2"
                    size="sm"
                    onClick={() =>
                      toggleType(type.name === "All Types" ? null : typeValue)
                    }
                  >
                    {type.name !== "All Types" && (
                      <Image
                        src={type.icon || ""}
                        alt={type.name}
                        width={28}
                        height={28}
                      />
                    )}
                    {type.name}
                  </Button>
                );
              })}
            </div>

            {/* The Sort + Filters */}
            <div className="flex items-center gap-6">
              <div className="flex gap-2 items-center">
                <p>Sort Price</p>
                <div className="flex rounded-full">
                  <Button variant="ghost" size="icon-sm" className="rounded-full"><ArrowUp className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon-sm" className="rounded-full"><ArrowDown className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="h-6 w-px bg-black"/>
              <div className="flex gap-2 items-center">
                <p>Sort Release</p>
                <div className="flex rounded-full">
                  <Button variant="ghost" size="icon-sm" className="rounded-full"><ArrowUp className="w-3 h-3" /></Button>
                  <Button variant="ghost" size="icon-sm" className="rounded-full"><ArrowDown className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="h-6 w-px bg-black"/>
              <FilterSheet />
            </div>
          </div>

          {/* Sizes Button Chips */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {AvailableSizes.map((size) => {
                const [path, query] = size.path.split("?");
                const sizeValue = query?.split("=")[1];

                // Special case: When all sizes are selected, only "All Sizes" is active
                // Individual sizes are NOT active when all are selected
                let isActive = false;
                if (size.name === "All Sizes") {
                  // "All Sizes" is active when no sizes selected OR all sizes selected
                  isActive = selectedSizes.length === 0 || allSizesSelected;
                } else {
                  // Individual size is active ONLY if:
                  // - It's in the selection AND
                  // - Not all sizes are selected
                  isActive =
                    selectedSizes.includes(sizeValue) && !allSizesSelected;
                }

                return (
                  <Button
                    key={size.name}
                    variant={isActive ? "default" : "secondary"}
                    className="font-normal"
                    size="sm"
                    onClick={() =>
                      toggleSize(size.name === "All Sizes" ? null : sizeValue)
                    }
                  >
                    {size.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* The Products */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-3 mt-6">
        {/* The Product Card */}
        {products.map((product) => (
          <ProductCard
            key={product.name}
            id={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
            discount={product.discount}
            sizes={product.sizes}
          />
        ))}
      </div>
    </div>
  );
};

const ProductsPage = () => {
  return (
    <Suspense
      fallback={<div className="mt-[88px] w-screen p-8 pt-4">Loading...</div>}
    >
      <ProductsPageContent />
    </Suspense>
  );
};

export default ProductsPage;
