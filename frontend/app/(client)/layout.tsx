import type { Metadata } from "next";
import { fontDisplay, fontText } from "@/fonts/font";
import "../globals.css";
import { Suspense } from "react";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Youtube } from "lucide-react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "MIONA",
  description: "Where simplicity meets sophistication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontDisplay.variable} ${fontText.variable} antialiased`}
      >
        <Suspense fallback={<div />}>
          <Navbar />
        </Suspense>
        {children}
        <footer className="mt-12 w-screen p-12 flex flex-col items-center gap-12">
          <img
            src={`${BASE_PATH}/logo-black.svg`}
            alt="MIONA"
            className="w-full h-auto"
          />
          {/* <div className="flex gap-12">
            <Instagram  className="w-9 h-9 opacity-50 hover:opacity-100 ease-in duration-100 cursor-pointer"/>
            <Facebook className="w-9 h-9 opacity-50 hover:opacity-100 ease-in duration-100 cursor-pointer" />
            <Youtube className="w-9 h-9 opacity-50 hover:opacity-100 ease-in duration-100 cursor-pointer" />
          </div> */}
        </footer>
      </body>
    </html>
  );
}
