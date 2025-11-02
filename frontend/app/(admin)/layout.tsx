"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import { fontDisplay, fontText } from "@/fonts/font";
import "../globals.css";
import Image from "next/image";
import Link from "next/link";
import {
  ChartArea,
  DollarSign,
  Home,
  LogOut,
  Plus,
  User,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";
const CART_STORAGE_KEY = "cartItems";
const CHECKOUT_SNAPSHOT_KEY = "cartCheckoutSnapshot";

const MenuList = ({
  icon,
  name,
  path,
  isActive,
}: {
  icon: ReactNode;
  name: string;
  path: string;
  isActive: boolean;
}) => {
  return (
    <Link
      href={path}
      className={cn(
        "h-12 flex items-center gap-3 px-3 rounded-md hover:bg-neutral-100 ease-in duration-200 cursor-pointer",
        isActive ? "bg-blue-50 text-blue-800" : ""
      )}
    >
      {icon}
      <p className={`text-base`}>{name}</p>
    </Link>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(
    null
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const loadUserFromStorage = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = window.localStorage.getItem("user");

      if (!raw) {
        setUser(null);
        return;
      }

      const stored = JSON.parse(raw) as {
        email?: string;
        name?: string;
        first_name?: string;
        last_name?: string;
        role?: string;
      };

      if (!stored?.email) {
        setUser(null);
        return;
      }

      const derivedName =
        stored.name ||
        [stored.first_name, stored.last_name]
          .filter(Boolean)
          .join(" ")
          .trim() ||
        stored.email.split("@")[0];

      setUser({
        name: derivedName,
        email: stored.email,
        role: stored.role,
      });
    } catch (error) {
      console.error("Failed to parse stored user", error);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    loadUserFromStorage();

    const handleAuthChange = () => loadUserFromStorage();

    window.addEventListener("authChange", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authChange", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [loadUserFromStorage]);

  // Check if user is admin
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const checkAdminAccess = () => {
      try {
        const raw = window.localStorage.getItem("user");

        if (!raw) {
          // No user logged in
          alert("Access denied. You must be logged in as an admin to access this page.");
          router.push("/");
          return;
        }

        const stored = JSON.parse(raw) as { role?: string };

        if (stored.role !== "admin") {
          // User is not admin
          alert("Access denied. You must be an admin to access this page.");
          router.push("/");
          return;
        }

        setIsCheckingAuth(false);
      } catch (error) {
        console.error("Failed to check admin access", error);
        alert("Access denied. You must be an admin to access this page.");
        router.push("/");
      }
    };

    checkAdminAccess();
  }, [router]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      const response = await fetch(`${API_URL}/logout.php`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
      window.dispatchEvent(new Event("cartChange"));
      window.localStorage.removeItem("user");
      window.dispatchEvent(new Event("authChange"));
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [isLoggingOut, router]);

  // Normalize pathname by removing trailing slash
  const normalizedPath = pathname.endsWith('/') && pathname !== '/'
    ? pathname.slice(0, -1)
    : pathname;

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <html lang="en">
        <body className={`${fontDisplay.variable} ${fontText.variable} antialiased`}>
          <div className="min-h-screen flex items-center justify-center bg-neutral-100">
            <div className="text-center">
              <p className="text-lg text-gray-600">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${fontDisplay.variable} ${fontText.variable} antialiased`}
      >
        <div className="grid grid-cols-[320px_1fr] bg-neutral-100 min-h-screen">
          {/* Sidebar */}
          <div className="h-screen w-full flex py-3 pl-3">
            <div className="flex-1 bg-white border border-black/10 shadow-md rounded-xl flex flex-col">
              <div className="flex flex-col flex-1 gap-6 p-4">
                <a
                  href="/admin"
                  className="w-full flex items-center justify-center p-2"
                >
                  <Image
                    src={`${BASE_PATH}/logo-black.svg`}
                    alt="MIONA"
                    width={125.5}
                    height={24}
                  />
                </a>

                <MenuList
                  icon={<Home className="w-5 h-5" />}
                  name="Dashboard"
                  path="/admin"
                  isActive={normalizedPath === "/admin"}
                />

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Insights & Actions
                  </p>
                  <MenuList
                    icon={<Plus className="w-5 h-5" />}
                    name="Manage Products"
                    path="/admin/products"
                    isActive={normalizedPath === "/admin/products"}
                  />
                  <MenuList
                    icon={<DollarSign className="w-5 h-5" />}
                    name="Transactions"
                    path="/admin/transactions"
                    isActive={normalizedPath === "/admin/transactions"}
                  />
                  <MenuList
                    icon={<User className="w-5 h-5" />}
                    name="Customer Lists"
                    path="/admin/customers"
                    isActive={normalizedPath === "/admin/customers"}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Analytics
                  </p>
                  <MenuList
                    icon={<ChartArea className="w-5 h-5" />}
                    name="Sales Report"
                    path="/admin/sales"
                    isActive={normalizedPath === "/admin/sales"}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border-t border-black/10">
                <div className="flex items-center gap-3">
                  <UserCircle className="w-9 h-9" />
                  <div className="flex flex-col">
                    <p className="text-base font-medium">
                      {user?.name || "Guest"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email || "Not signed in"}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  aria-label="Log out"
                >
                  <LogOut />
                </Button>
              </div>
            </div>
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}
