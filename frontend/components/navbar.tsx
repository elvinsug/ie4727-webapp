"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LogIn,
  Menu,
  SearchIcon,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

const menuItems = [
  //   {
  //     name: "Home",
  //     path: "/miona",
  //   },
  //   {
  //     name: "On Sale",
  //     path: "/products?on_sale=true",
  //   },
  {
    name: "Men",
    path: "/products?sex=men",
  },
  {
    name: "Women",
    path: "/products?sex=women",
  },
  {
    name: "Accessories",
    path: "/products?type=accessories",
  },
];

const Navbar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <div className="fixed top-3 inset-x-3">
      <div className="grid grid-cols-2 md:grid-cols-3 h-16 px-3 md:px-6 w-full rounded-md bg-white/95 backdrop-blur-md relative">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            variant="ghost"
            size="icon-lg"
            className="md:hidden"
          >
            <Menu />
          </Button>
          <a href="/miona" className="flex h-full items-center cursor-pointer">
            <Image
              src={`${BASE_PATH}/logo-black.svg`}
              alt="MIONA"
              width={125.5}
              height={24}
            />
          </a>
        </div>
        <nav className="hidden md:flex items-center justify-center h-full gap-2">
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
          {/* Desktop Search - Expandable */}
          <div className="hidden md:flex items-center">
            <div
              className={`flex items-center overflow-hidden transition-all duration-300 ease-in-out ${
                isSearchOpen ? "w-64" : "w-10"
              }`}
            >
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="shrink-0"
              >
                <SearchIcon />
              </Button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`transition-all duration-300 ease-in-out bg-transparent border-none outline-none text-sm ${
                  isSearchOpen ? "w-full opacity-100 ml-2" : "w-0 opacity-0"
                }`}
                onBlur={() => {
                  if (!searchQuery) {
                    setTimeout(() => setIsSearchOpen(false), 150);
                  }
                }}
              />
            </div>
          </div>

          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="md:hidden"
          >
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
              <Link href="/login">
                <LogIn />
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Menu Options Open */}
        {isMenuOpen && (
          <div className="absolute top-[72px] inset-x-0 flex flex-col gap-1 p-2 bg-white rounded-md">
            {menuItems.map((menu) => {
              return (
                <Button
                  key={menu.name}
                  variant="ghost"
                  size="lg"
                  className="w-full"
                >
                  <Link href={menu.path}>{menu.name}</Link>
                </Button>
              );
            })}
          </div>
        )}

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden absolute top-[72px] inset-x-0 bg-white/95 backdrop-blur-md rounded-md p-3 animate-in slide-in-from-top-2 duration-200">
            <div className="relative flex items-center">
              <SearchIcon className="absolute left-3 w-4 h-4 text-gray-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-gray-400 transition-colors"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="absolute right-3 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close search"
              >
                <XCircle className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
