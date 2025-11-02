"use client";

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
import { usePathname } from "next/navigation";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const admin = {
  name: "John Doe",
  email: "john.doe@example.com",
  role: "Admin",
};

const MenuList = ({
  icon,
  name,
  path,
  isActive,
}: {
  icon: React.ReactNode;
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
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Normalize pathname by removing trailing slash
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;

  return (
    <html lang="en">
      <body
        className={`${fontDisplay.variable} ${fontText.variable} antialiased bg-neutral-100`}
      >
        <div className="grid grid-cols-[320px_1fr]">
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
                    <p className="text-base font-medium">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {admin.email}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon-lg">
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
