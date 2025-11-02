"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function CheckoutResultPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <Link href="/" className="inline-block mb-12">
          <Image
            src={`${BASE_PATH}/logo-black.svg`}
            alt="MIONA"
            width={125.5}
            height={24}
          />
        </Link>

        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="w-20 h-20 text-green-600" strokeWidth={1.5} />
        </div>

        {/* Success Message */}
        <h1 className="text-3xl font-bold mb-4">Payment Successful</h1>
        
        <p className="text-gray-600 mb-2">
          Thank you for your purchase!
        </p>
        
        <p className="text-gray-600 mb-8">
          Your order confirmation and receipt have been sent to your email address. 
          We&apos;ll notify you when your order ships.
        </p>

        {/* CTA Button */}
        <Link href="/" className="inline-block w-full">
          <Button variant="outline" size="lg" className="w-full">
            Continue Shopping
          </Button>
        </Link>
      </div>
    </div>
  );
}

