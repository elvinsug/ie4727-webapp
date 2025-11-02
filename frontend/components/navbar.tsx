"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LogIn, SearchIcon, ShoppingBag, User } from "lucide-react";
import { useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const menuItems = [
  //   {
  //     name: "Home",
  //     path: "/nova",
  //   },
  {
    name: "On Sale",
    path: "/nova/products?on_sale=true",
  },
  {
    name: "Men",
    path: "/nova/products?gender=men",
  },
  {
    name: "Women",
    path: "/nova/products?gender=women",
  },
  {
    name: "Accessories",
    path: "/nova/products?type=accessories",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="fixed top-3 inset-x-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 h-16 px-6 w-full rounded-md bg-white/95 backdrop-blur-md">
        <a href="/nova" className="flex h-full items-center cursor-pointer">
          <Image
            src={`${BASE_PATH}/logo-black.svg`}
            alt="MIONA"
            width={125.5}
            height={24}
          />
        </a>
        <nav className="flex items-center justify-center h-full gap-2">
          {menuItems.map((menu) => {
            const [path, query] = menu.path.split("?");
            const currentQuery = searchParams.toString();
            const isActive =
              pathname.includes(path.split("/").pop() || "") &&
              currentQuery === query;
            return (
              <Button
                key={menu.name}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="w-fit text-sm"
              >
                <Link href={menu.path}>{menu.name}</Link>
              </Button>
            );
          })}
        </nav>
        <div className="flex gap-2 justify-end items-center w-full">
          <Button variant="ghost" size="icon-lg">
            <SearchIcon />
          </Button>
          {isLoggedIn ? (
            <>
              <Button variant="ghost" size="icon-lg">
                <User />
              </Button>
              <Button variant="ghost" size="icon-lg">
                <ShoppingBag />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="icon-lg">
              <Link href="/login"><LogIn /></Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
