"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  Home,
  Store,
  X,
  Lock,
  CreditCard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";
const CART_STORAGE_KEY = "cartItems";
const CHECKOUT_SNAPSHOT_KEY = "cartCheckoutSnapshot";
const FALLBACK_IMAGE = "/product/mock-image-1.webp";

// Singapore postal districts and regions
const singaporePostalDistricts = [
  { code: "01-08", region: "Central" },
  { code: "09-10", region: "Orchard" },
  { code: "11-13", region: "City" },
  { code: "14-16", region: "East" },
  { code: "17", region: "North" },
  { code: "18-19", region: "Central" },
  { code: "20-21", region: "West" },
  { code: "22-23", region: "North" },
  { code: "24-27", region: "East" },
  { code: "28-29", region: "Central" },
  { code: "30-34", region: "Central" },
  { code: "35-37", region: "Central" },
  { code: "38-41", region: "Central" },
  { code: "42-45", region: "East" },
  { code: "46-48", region: "North" },
  { code: "49-50", region: "East" },
  { code: "51-53", region: "East" },
  { code: "54-55", region: "East" },
  { code: "56-57", region: "East" },
  { code: "58-59", region: "East" },
  { code: "60-64", region: "West" },
  { code: "65-69", region: "North" },
  { code: "70-71", region: "North" },
  { code: "72-73", region: "North" },
  { code: "75-78", region: "North" },
  { code: "79-80", region: "North" },
  { code: "81-82", region: "East" },
];

type Step = "shipping" | "payment";

interface ShippingFormData {
  deliveryMethod: "home" | "pickup";
  savedAddress: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  postalCode: string;
  region: string;
  phone: string;
  acceptedPrivacy: boolean;
}

interface PaymentFormData {
  cardNumber: string;
  expirationDate: string;
  securityCode: string;
  nameOnCard: string;
  needInvoice: boolean;
  acceptedPrivacy: boolean;
}

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

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("shipping");
  const [discountCode, setDiscountCode] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartReady, setIsCartReady] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  // Shipping form state
  const [shippingForm, setShippingForm] = useState<ShippingFormData>({
    deliveryMethod: "home",
    savedAddress: "",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    postalCode: "",
    region: "",
    phone: "",
    acceptedPrivacy: false,
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    cardNumber: "",
    expirationDate: "",
    securityCode: "",
    nameOnCard: "",
    needInvoice: false,
    acceptedPrivacy: false,
  });

  // Form errors
  const [shippingErrors, setShippingErrors] = useState<
    Partial<Record<keyof ShippingFormData, string>>
  >({});
  const [paymentErrors, setPaymentErrors] = useState<
    Partial<Record<keyof PaymentFormData, string>>
  >({});

  // Processing state
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const syncCartFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawSnapshot = window.localStorage.getItem(CHECKOUT_SNAPSHOT_KEY);
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

      let parsed: unknown = null;

      if (rawSnapshot) {
        try {
          parsed = JSON.parse(rawSnapshot);
        } catch (parseError) {
          console.error("Failed to parse checkout snapshot JSON", parseError);
          parsed = null;
        }
      }

      if (!parsed && rawCart) {
        try {
          parsed = JSON.parse(rawCart);
        } catch (parseError) {
          console.error("Failed to parse cart JSON", parseError);
          parsed = null;
        }
      }

      if (!parsed) {
        setCartItems([]);
        setCartError(null);
        setIsCartReady(true);
        return;
      }

      if (!Array.isArray(parsed)) {
        setCartItems([]);
        setCartError(null);
        setIsCartReady(true);
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

          const quantityValue = Number((item as any).quantity);
          const stockValue = Number((item as any).stock);
          const maxStock =
            Number.isFinite(stockValue) && stockValue > 0
              ? stockValue
              : Number.MAX_SAFE_INTEGER;

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
            discountPercentage:
              Number((item as any).discountPercentage) || 0,
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
      setCartError(null);
    } catch (error) {
      console.error("Failed to load cart from storage", error);
      setCartItems([]);
      setCartError("Unable to load cart items.");
    } finally {
      setIsCartReady(true);
    }
  }, []);

  useEffect(() => {
    syncCartFromStorage();

    const handleSync = () => {
      syncCartFromStorage();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("cartChange", handleSync);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("cartChange", handleSync);
    };
  }, [syncCartFromStorage]);

  const getFinalPrice = useCallback((price: number, discount: number) => {
    return price * (1 - discount / 100);
  }, []);

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const finalPrice = getFinalPrice(item.price, item.discountPercentage);
      return sum + finalPrice * item.quantity;
    }, 0);
  }, [cartItems, getFinalPrice]);

  const tax = subtotal * 0.09; // 9% GST
  const total = subtotal + tax;
  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );
  const shipping = cartItems.length === 0 ? 0 : step === "payment" ? 0 : null;

  // Calculate totals
  // Validate Singapore postal code
  const validatePostalCode = (code: string): boolean => {
    return /^\d{6}$/.test(code);
  };

  // Get region from postal code
  const getRegionFromPostalCode = (code: string): string => {
    if (!validatePostalCode(code)) return "";
    const district = code.substring(0, 2);
    const districtNum = parseInt(district);

    for (const entry of singaporePostalDistricts) {
      const [start, end] = entry.code.split("-").map((n) => parseInt(n));
      if (districtNum >= start && districtNum <= (end || start)) {
        return entry.region;
      }
    }
    return "";
  };

  // Validate Singapore phone number
  const validatePhone = (phone: string): boolean => {
    return /^[689]\d{7}$/.test(phone.replace(/\s/g, ""));
  };

  // Validate credit card number (Luhn algorithm)
  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, "");
    if (!/^\d{13,19}$/.test(cleaned)) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  // Validate expiration date
  const validateExpirationDate = (date: string): boolean => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;

    const [month, year] = date.split("/").map((n) => parseInt(n));
    if (month < 1 || month > 12) return false;

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;

    return true;
  };

  // Validate CVV
  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof ShippingFormData, string>> = {};

    if (!shippingForm.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!shippingForm.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!shippingForm.address.trim()) {
      errors.address = "Address is required";
    }

    if (!shippingForm.postalCode.trim()) {
      errors.postalCode = "Postal code is required";
    } else if (!validatePostalCode(shippingForm.postalCode)) {
      errors.postalCode = "Invalid Singapore postal code (6 digits)";
    }

    if (!shippingForm.region.trim()) {
      errors.region = "Region is required";
    }

    if (!shippingForm.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!validatePhone(shippingForm.phone)) {
      errors.phone = "Invalid Singapore phone number";
    }

    if (!shippingForm.acceptedPrivacy) {
      errors.acceptedPrivacy = "You must accept the privacy policy";
    }

    setShippingErrors(errors);

    if (Object.keys(errors).length === 0) {
      setStep("payment");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Handle payment form submission
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Partial<Record<keyof PaymentFormData, string>> = {};

    if (!paymentForm.cardNumber.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!validateCardNumber(paymentForm.cardNumber)) {
      errors.cardNumber = "Invalid card number";
    }

    if (!paymentForm.expirationDate.trim()) {
      errors.expirationDate = "Expiration date is required";
    } else if (!validateExpirationDate(paymentForm.expirationDate)) {
      errors.expirationDate = "Invalid or expired date";
    }

    if (!paymentForm.securityCode.trim()) {
      errors.securityCode = "Security code is required";
    } else if (!validateCVV(paymentForm.securityCode)) {
      errors.securityCode = "Invalid CVV (3-4 digits)";
    }

    if (!paymentForm.nameOnCard.trim()) {
      errors.nameOnCard = "Name on card is required";
    }

    if (!paymentForm.acceptedPrivacy) {
      errors.acceptedPrivacy = "You must accept the privacy policy";
    }

    setPaymentErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsProcessingPayment(true);
      setProcessingError(null);

      try {
        // Build shipping address string
        const shippingAddress = [
          shippingForm.address,
          shippingForm.apartment,
          shippingForm.postalCode,
          shippingForm.region,
          "Singapore",
        ]
          .filter(Boolean)
          .join(", ");

        // Process each cart item purchase
        for (const item of cartItems) {
          const formData = new FormData();
          formData.append("product_option_id", String(item.productOptionId));
          formData.append("quantity", String(item.quantity));
          formData.append("payment_method", "Credit Card");
          formData.append("shipping_address", shippingAddress);
          formData.append(
            "notes",
            `Customer: ${shippingForm.firstName} ${shippingForm.lastName}, Phone: ${shippingForm.phone}, Delivery: ${shippingForm.deliveryMethod}`
          );

          const response = await fetch(`${API_URL}/buy_product_options.php`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          let payload: any = null;

          try {
            payload = await response.json();
          } catch (parseError) {
            payload = null;
          }

          if (!response.ok || !payload?.success) {
            throw new Error(
              payload?.error || `Failed to process purchase for ${item.productName}`
            );
          }
        }

        // Clear cart after successful purchase
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(CART_STORAGE_KEY);
          window.localStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
          window.dispatchEvent(new Event("cartChange"));
        }

        setCartItems([]);

        // Navigate to result page
        router.push("/checkout/result");
      } catch (error) {
        setProcessingError(
          error instanceof Error
            ? error.message
            : "Unable to complete payment. Please try again."
        );
        setIsProcessingPayment(false);
      }
    }
  };

  // Auto-format card number
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, "");
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(" ");
  };

  // Auto-format expiration date
  const formatExpirationDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  // Handle postal code change
  const handlePostalCodeChange = (value: string) => {
    setShippingForm((prev) => ({
      ...prev,
      postalCode: value,
      region: getRegionFromPostalCode(value),
    }));
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 min-h-screen">
          {/* Left Section - Form */}
          <div className="lg:border-r border-gray-200 overflow-y-auto h-screen">
            <div className="max-w-2xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
              {/* Logo */}
              <Link href="/" className="inline-block mb-12">
              <Image
                    src={`${BASE_PATH}/logo-black.svg`}
                    alt="MIONA"
                    width={125.5}
                    height={24}
                  />
              </Link>

              {step === "shipping" ? (
                <form onSubmit={handleShippingSubmit} className="space-y-8">
                  {/* Delivery Method */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Delivery method
                    </h2>
                    <div className="space-y-3">
                      <label
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          shippingForm.deliveryMethod === "home"
                            ? "border-black bg-neutral-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={shippingForm.deliveryMethod === "home"}
                          onChange={() =>
                            setShippingForm((prev) => ({
                              ...prev,
                              deliveryMethod: "home",
                            }))
                          }
                          className="w-5 h-5"
                        />
                        <Home className="w-5 h-5" />
                        <span className="">Home delivery</span>
                      </label>

                      <label
                        className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                          shippingForm.deliveryMethod === "pickup"
                            ? "border-black bg-neutral-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          checked={shippingForm.deliveryMethod === "pickup"}
                          onChange={() =>
                            setShippingForm((prev) => ({
                              ...prev,
                              deliveryMethod: "pickup",
                            }))
                          }
                          className="w-5 h-5"
                        />
                        <Store className="w-5 h-5" />
                        <span className="">Store pickup</span>
                      </label>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h2 className="text-lg font-medium mb-4">
                      Shipping address
                    </h2>
                    <div className="space-y-4">
                      {/* Saved Addresses */}
                      <div>
                        <Label htmlFor="savedAddress" className="text-xs text-gray-600 mb-1.5">
                          Saved addresses
                        </Label>
                        <Select
                          value={shippingForm.savedAddress}
                          onValueChange={(value) =>
                            setShippingForm((prev) => ({
                              ...prev,
                              savedAddress: value,
                            }))
                          }
                        >
                          <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Singapore (Default)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">
                              Singapore (Default)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Country/Region */}
                      <div>
                        <Label htmlFor="country" className="text-xs text-gray-600 mb-1.5">
                          Country/Region
                        </Label>
                        <Select value="SG" disabled>
                          <SelectTrigger className="w-full h-11">
                            <SelectValue placeholder="Singapore" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SG">Singapore</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* First Name & Last Name */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="text-xs text-gray-600 mb-1.5">
                            First name
                          </Label>
                          <Input
                            id="firstName"
                            value={shippingForm.firstName}
                            onChange={(e) =>
                              setShippingForm((prev) => ({
                                ...prev,
                                firstName: e.target.value,
                              }))
                            }
                            className="h-11"
                            aria-invalid={!!shippingErrors.firstName}
                          />
                          {shippingErrors.firstName && (
                            <p className="text-xs text-red-600 mt-1">
                              {shippingErrors.firstName}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName" className="text-xs text-gray-600 mb-1.5">
                            Last name
                          </Label>
                          <Input
                            id="lastName"
                            value={shippingForm.lastName}
                            onChange={(e) =>
                              setShippingForm((prev) => ({
                                ...prev,
                                lastName: e.target.value,
                              }))
                            }
                            className="h-11"
                            aria-invalid={!!shippingErrors.lastName}
                          />
                          {shippingErrors.lastName && (
                            <p className="text-xs text-red-600 mt-1">
                              {shippingErrors.lastName}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Address */}
                      <div>
                        <Label htmlFor="address" className="text-xs text-gray-600 mb-1.5">
                          Address
                        </Label>
                        <Input
                          id="address"
                          value={shippingForm.address}
                          onChange={(e) =>
                            setShippingForm((prev) => ({
                              ...prev,
                              address: e.target.value,
                            }))
                          }
                          className="h-11"
                          aria-invalid={!!shippingErrors.address}
                        />
                        {shippingErrors.address && (
                          <p className="text-xs text-red-600 mt-1">
                            {shippingErrors.address}
                          </p>
                        )}
                      </div>

                      {/* Apartment */}
                      <div>
                        <Label htmlFor="apartment" className="text-xs text-gray-600 mb-1.5">
                          Apartment, suite, etc. (optional)
                        </Label>
                        <Input
                          id="apartment"
                          value={shippingForm.apartment}
                          onChange={(e) =>
                            setShippingForm((prev) => ({
                              ...prev,
                              apartment: e.target.value,
                            }))
                          }
                          className="h-11"
                        />
                      </div>

                      {/* Postal Code, Region */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="postalCode" className="text-xs text-gray-600 mb-1.5">
                            Postal code
                          </Label>
                          <Input
                            id="postalCode"
                            value={shippingForm.postalCode}
                            onChange={(e) =>
                              handlePostalCodeChange(e.target.value)
                            }
                            maxLength={6}
                            className="h-11"
                            aria-invalid={!!shippingErrors.postalCode}
                          />
                          {shippingErrors.postalCode && (
                            <p className="text-xs text-red-600 mt-1">
                              {shippingErrors.postalCode}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="region" className="text-xs text-gray-600 mb-1.5">
                            Region
                          </Label>
                          <Select
                            value={shippingForm.region}
                            onValueChange={(value) =>
                              setShippingForm((prev) => ({
                                ...prev,
                                region: value,
                              }))
                            }
                          >
                            <SelectTrigger className="w-full h-11" aria-invalid={!!shippingErrors.region}>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Central">Central</SelectItem>
                              <SelectItem value="East">East</SelectItem>
                              <SelectItem value="North">North</SelectItem>
                              <SelectItem value="West">West</SelectItem>
                              <SelectItem value="Orchard">Orchard</SelectItem>
                              <SelectItem value="City">City</SelectItem>
                            </SelectContent>
                          </Select>
                          {shippingErrors.region && (
                            <p className="text-xs text-red-600 mt-1">
                              {shippingErrors.region}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <Label htmlFor="phone" className="text-xs text-gray-600 mb-1.5">
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) =>
                            setShippingForm((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="e.g. 91234567"
                          className="h-11"
                          aria-invalid={!!shippingErrors.phone}
                        />
                        {shippingErrors.phone && (
                          <p className="text-xs text-red-600 mt-1">
                            {shippingErrors.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Privacy Policy */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shippingForm.acceptedPrivacy}
                        onChange={(e) =>
                          setShippingForm((prev) => ({
                            ...prev,
                            acceptedPrivacy: e.target.checked,
                          }))
                        }
                        className="mt-0.5 w-5 h-5 shrink-0"
                      />
                      <span className="text-sm">
                        I have read and accept the{" "}
                        <a
                          href="/privacy-policy"
                          className="underline font-medium"
                        >
                          privacy policy
                        </a>
                        .
                      </span>
                    </label>
                    {shippingErrors.acceptedPrivacy && (
                      <p className="text-xs text-red-600 mt-1 ml-8">
                        {shippingErrors.acceptedPrivacy}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4">
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-sm hover:underline"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Return to cart
                    </Link>
                    <Button
                      type="submit"
                      size="lg"
                      className="px-8"
                    >
                      Continue to shipping
                    </Button>
                  </div>

                  {/* Footer Links */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-8 border-t">
                    <a href="/refund-policy" className="underline hover:text-black">
                      Refund policy
                    </a>
                    <a href="/shipping" className="underline hover:text-black">
                      Shipping
                    </a>
                    <a href="/privacy-policy" className="underline hover:text-black">
                      Privacy policy
                    </a>
                    <a href="/terms" className="underline hover:text-black">
                      Terms of service
                    </a>
                    <a href="/legal" className="underline hover:text-black">
                      Legal notice
                    </a>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-8">
                  {/* Contact Info Summary */}
                  <div className="space-y-3 pb-6 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Contact</p>
                        <p className="text-sm font-medium">
                          {shippingForm.firstName.toLowerCase()}.
                          {shippingForm.lastName.toLowerCase()}@example.com
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("shipping")}
                        className="text-sm underline hover:no-underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">Ship to</p>
                        <p className="text-sm font-medium">
                          {shippingForm.address}, {shippingForm.apartment && `${shippingForm.apartment}, `}
                          {shippingForm.postalCode}, Singapore
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setStep("shipping")}
                        className="text-sm underline hover:no-underline"
                      >
                        Change
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 mb-1">
                          Shipping method
                        </p>
                        <p className="text-sm font-medium">
                          1 - International standard 4-10 working days | UPS ·{" "}
                          <span className="font-bold">FREE</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}
                  <div>
                    <h2 className="text-lg font-medium mb-2">Payment</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      All transactions are secure and encrypted.
                    </p>

                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Payment Method Header */}
                      <div className="flex items-center justify-between p-4 bg-neutral-50 border-b border-gray-300">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked
                            readOnly
                            className="w-5 h-5"
                          />
                          <span className="font-medium">Credit card</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-6 h-6 text-gray-600" />
                          <span className="text-xs text-gray-600">+2</span>
                        </div>
                      </div>

                      {/* Payment Form */}
                      <div className="p-4 space-y-4">
                        {/* Card Number */}
                        <div>
                          <div className="relative">
                            <Input
                              id="cardNumber"
                              placeholder="Card number"
                              value={paymentForm.cardNumber}
                              onChange={(e) => {
                                const formatted = formatCardNumber(
                                  e.target.value
                                );
                                if (formatted.replace(/\s/g, "").length <= 19) {
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    cardNumber: formatted,
                                  }));
                                }
                              }}
                              className="h-11 pr-10"
                              aria-invalid={!!paymentErrors.cardNumber}
                            />
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          {paymentErrors.cardNumber && (
                            <p className="text-xs text-red-600 mt-1">
                              {paymentErrors.cardNumber}
                            </p>
                          )}
                        </div>

                        {/* Expiration & CVV */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Input
                              id="expirationDate"
                              placeholder="Expiration date (MM / YY)"
                              value={paymentForm.expirationDate}
                              onChange={(e) => {
                                const formatted = formatExpirationDate(
                                  e.target.value
                                );
                                if (formatted.length <= 5) {
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    expirationDate: formatted,
                                  }));
                                }
                              }}
                              className="h-11"
                              aria-invalid={!!paymentErrors.expirationDate}
                            />
                            {paymentErrors.expirationDate && (
                              <p className="text-xs text-red-600 mt-1">
                                {paymentErrors.expirationDate}
                              </p>
                            )}
                          </div>
                          <div>
                            <Input
                              id="securityCode"
                              placeholder="Security code"
                              value={paymentForm.securityCode}
                              onChange={(e) => {
                                const value = e.target.value.replace(
                                  /\D/g,
                                  ""
                                );
                                if (value.length <= 4) {
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    securityCode: value,
                                  }));
                                }
                              }}
                              className="h-11"
                              aria-invalid={!!paymentErrors.securityCode}
                            />
                            {paymentErrors.securityCode && (
                              <p className="text-xs text-red-600 mt-1">
                                {paymentErrors.securityCode}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Name on Card */}
                        <div>
                          <Label htmlFor="nameOnCard" className="text-xs text-gray-600 mb-1.5">
                            Name on card
                          </Label>
                          <div className="relative">
                            <Input
                              id="nameOnCard"
                              value={paymentForm.nameOnCard}
                              onChange={(e) =>
                                setPaymentForm((prev) => ({
                                  ...prev,
                                  nameOnCard: e.target.value,
                                }))
                              }
                              className="h-11"
                              aria-invalid={!!paymentErrors.nameOnCard}
                            />
                            {paymentForm.nameOnCard && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPaymentForm((prev) => ({
                                    ...prev,
                                    nameOnCard: "",
                                  }))
                                }
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                              >
                                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                              </button>
                            )}
                          </div>
                          {paymentErrors.nameOnCard && (
                            <p className="text-xs text-red-600 mt-1">
                              {paymentErrors.nameOnCard}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Invoice */}
                  <div>
                    <h3 className="text-base font-medium mb-3">
                      Do you need an invoice?
                    </h3>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentForm.needInvoice}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            needInvoice: e.target.checked,
                          }))
                        }
                        className="mt-0.5 w-5 h-5 shrink-0"
                      />
                      <span className="text-sm">
                        Check this box if you need an invoice for your purchase
                      </span>
                    </label>
                  </div>

                  {/* Privacy Policy */}
                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={paymentForm.acceptedPrivacy}
                        onChange={(e) =>
                          setPaymentForm((prev) => ({
                            ...prev,
                            acceptedPrivacy: e.target.checked,
                          }))
                        }
                        className="mt-0.5 w-5 h-5 shrink-0"
                      />
                      <span className="text-sm">
                        I have read and accept the{" "}
                        <a
                          href="/privacy-policy"
                          className="underline font-medium"
                        >
                          privacy policy
                        </a>
                        .
                      </span>
                    </label>
                    {paymentErrors.acceptedPrivacy && (
                      <p className="text-xs text-red-600 mt-1 ml-8">
                        {paymentErrors.acceptedPrivacy}
                      </p>
                    )}
                  </div>

                  {/* Processing Error */}
                  {processingError && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm text-red-600">{processingError}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep("shipping")}
                      className="flex items-center gap-2 text-sm hover:underline"
                      disabled={isProcessingPayment}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Return to shipping
                    </button>
                    <Button
                      type="submit"
                      size="lg"
                      className="px-8"
                      disabled={isProcessingPayment}
                    >
                      {isProcessingPayment ? "Processing..." : "Pay now"}
                    </Button>
                  </div>

                  {/* Footer Links */}
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-8 border-t">
                    <a href="/refund-policy" className="underline hover:text-black">
                      Refund policy
                    </a>
                    <a href="/shipping" className="underline hover:text-black">
                      Shipping
                    </a>
                    <a href="/privacy-policy" className="underline hover:text-black">
                      Privacy policy
                    </a>
                    <a href="/terms" className="underline hover:text-black">
                      Terms of service
                    </a>
                    <a href="/legal" className="underline hover:text-black">
                      Legal notice
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right Section - Order Summary */}
          <div className="bg-neutral-50 overflow-y-auto h-screen">
            <div className="max-w-xl mx-auto px-6 py-8 lg:px-12 lg:py-12">
              {/* Order Items */}
                <div className="space-y-4 mb-6">
                {isCartReady && cartItems.length === 0 && (
                  <p className="text-sm text-gray-600">
                    Your cart is currently empty.
                  </p>
                )}
                {cartError && (
                  <p className="text-sm text-red-500">{cartError}</p>
                )}
                {cartItems.map((item) => {
                  const finalPrice = getFinalPrice(
                    item.price,
                    item.discountPercentage
                  );

                  return (
                    <div key={item.id} className="flex gap-4">
                    {/* Product Image with Quantity Badge */}
                    <div className="relative">
                      <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <Image
                          src={item.imageUrl || FALLBACK_IMAGE}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {item.quantity}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-sm mb-0.5">
                          {item.productName}
                        </h3>
                        <p className="text-xs text-gray-600 mb-1">
                          {[item.color, `Size ${item.size}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <button
                          type="button"
                          className="text-xs underline hover:no-underline"
                        >
                          Modificar
                        </button>
                      </div>
                      <p className="font-bold text-sm">
                        S${finalPrice.toFixed(2)}
                      </p>
                    </div>
                    </div>
                  );
                })}
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code or gift card"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 h-11"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="px-6"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-3 pt-6 border-t border-gray-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    Subtotal · {itemCount} {itemCount === 1 ? "item" : "items"}
                  </span>
                  <span className="font-medium">S${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">Shipping</span>
                  {shipping === null ? (
                    <span className="text-gray-500 text-xs">
                      Calculated at next step
                    </span>
                  ) : (
                    <span className="font-bold">FREE</span>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                  <div>
                    <span className="text-lg font-semibold">Total</span>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Including S${tax.toFixed(2)} in taxes
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-600 mr-2">
                      {step === "payment" ? "SGD" : "SGD"}
                    </span>
                    <span className="text-2xl font-bold">
                      S${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
