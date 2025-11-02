import type { Metadata } from "next";
import { fontDisplay, fontText } from "@/fonts/font";
import "../globals.css";

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
        {children}
      </body>
    </html>
  );
}
