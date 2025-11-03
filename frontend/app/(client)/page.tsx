"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

interface ProductOption {
  id: number;
  size: string;
  price: number;
  discount_percentage: number;
  stock: number;
}

interface DiscountedProduct {
  product_id: number;
  product_name: string;
  product_color_id: number;
  color: string;
  price: number;
  discount_percentage: number;
  image_url: string;
  image_url_2: string;
  total_stock: number;
  options: ProductOption[];
}

export default function Home() {
  const [discountedProducts, setDiscountedProducts] = useState<DiscountedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDiscountedProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/get_discounted.php?limit=3`);
        const data = await response.json();

        if (data.success && data.data) {
          setDiscountedProducts(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch discounted products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscountedProducts();
  }, []);
  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section*/}
      <section
        className="h-screen w-screen md:h-[85vh] bg-cover bg-center bg-no-repeat flex items-end p-6"
        style={{ backgroundImage: `url(${BASE_PATH}/banner/home.webp)` }}
      >
        <div className="flex gap-4">
          {/* Image */}
          {/* Content */}
          <div className="flex flex-col gap-4 p-6 rounded-md bg-black/10 backdrop-blur-sm">
            <div className="flex flex-col gap-1 text-white">
              <p className="font-thin">Limited Collection</p>
              <h4 className="font-display text-4xl font-medium">
                MIONA<span className="font-light"> Arch Suede</span>
              </h4>
            </div>
            <Button
              variant={"outline"}
              size={"lg"}
              className="w-fit border-white"
            >
              SEE COLLECTION
            </Button>
          </div>
        </div>
      </section>

      {/* Discount Item Carousel */}
      <section className="w-screen p-6 flex flex-col gap-6 mb-10">
        <h2 className="text-2xl font-bold font-display">Discount Items</h2>
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-gray-200 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : discountedProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {discountedProducts.map((item) => (
              <ProductCard
                key={item.product_color_id}
                id={item.product_id}
                name={`${item.product_name} - ${item.color}`}
                price={item.price}
                discount={item.discount_percentage}
                image={item.image_url || `${BASE_PATH}/product/mock-image-1.webp`}
                image2={item.image_url_2 || `${BASE_PATH}/product/mock-image-2.webp`}
                options={item.options}
                color={item.color}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No discounted items available at the moment.</p>
          </div>
        )}
      </section>

      {/* Banner */}
      <img
        src={`${BASE_PATH}/banner/middle-page.webp`}
        alt="Banner"
        className="w-full h-auto"
      />

      {/* Find Our Store */}
      <section className="w-screen p-6 flex flex-col gap-6 mb-10">
        <h2 className="text-2xl font-bold font-display">Locate Us</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col gap-6">
            <img
              src={`${BASE_PATH}/store/west.webp`}
              alt="West Store"
              className="w-full aspect-10/12 object-cover"
            />
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-xl">
                MIONA <span className="font-thin">West</span>
              </h5>
              <p className="text-sm text-gray-500">
                38 Nanyang Crescent Hall <br />
                Tamarind, #23-12-54, Singapore 648760
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <img
              src={`${BASE_PATH}/store/central.webp`}
              alt="West Store"
              className="w-full aspect-10/12 object-cover"
            />
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-xl">
                MIONA <span className="font-thin">Central</span>
              </h5>
              <p className="text-sm text-gray-500">
                38 Nanyang Crescent Hall <br />
                Tamarind, #23-12-54, Singapore 648760
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <img
              src={`${BASE_PATH}/store/east.webp`}
              alt="West Store"
              className="w-full aspect-10/12 object-cover"
            />
            <div className="flex flex-col gap-3">
              <h5 className="font-semibold text-xl">
                MIONA <span className="font-thin">East</span>
              </h5>
              <p className="text-sm text-gray-500">
                38 Nanyang Crescent Hall <br />
                Tamarind, #23-12-54, Singapore 648760
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
