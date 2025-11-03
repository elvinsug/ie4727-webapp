"use client";

import { useEffect, useState } from "react";
import { Edit, Trash, Trophy } from "lucide-react";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const FALLBACK_IMAGE = `${BASE_PATH}/product/mock-image-1.webp`;

type SalesSummary = {
  total_revenue: string;
  total_units_sold: number;
  total_transactions: number;
  unique_customers: number;
};

type SalesItem = {
  product_color_id: number;
  product_id: number;
  product_name: string;
  color: string;
  image_url: string | null;
  total_income: string;
  total_quantity: number;
};

type TopProduct = {
  rank: number;
  productColorId: number;
  productId: number;
  productName: string;
  color: string;
  imageUrl: string | null;
  totalIncome: number;
  totalQuantity: number;
  availableQuantity: number | null;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) {
    return currencyFormatter.format(0);
  }

  const numericValue =
    typeof value === "string" ? parseFloat(value) : Number(value);

  if (Number.isNaN(numericValue)) {
    return currencyFormatter.format(0);
  }

  return currencyFormatter.format(numericValue);
};

const AdminHome = () => {
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [listedItems, setListedItems] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchTopProductStock = async (productId: number) => {
      try {
        const response = await fetch(
          `${API_URL}/products/get_products.php?id=${productId}`,
          {
            credentials: "include",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.data)) {
          return {};
        }

        const stockMap: Record<number, number> = {};

        data.data.forEach((product: any) => {
          (product.colors || []).forEach((color: any) => {
            const colorId = Number(color.id);

            const totalStock = (color.options || []).reduce(
              (total: number, option: any) =>
                total + Number(option.stock || 0),
              0
            );

            if (!Number.isNaN(colorId)) {
              stockMap[colorId] = totalStock;
            }
          });
        });

        return stockMap;
      } catch (fetchError) {
        console.error(fetchError);
        return {};
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [salesResponse, productCountResponse] = await Promise.all([
          fetch(`${API_URL}/transactions/sales_report.php?limit=3`, {
            credentials: "include",
          }),
          fetch(`${API_URL}/products/get_product_colors.php?limit=1&page=1`, {
            credentials: "include",
          }),
        ]);

        if (!salesResponse.ok) {
          throw new Error("Unable to load sales data");
        }

        const salesJson = await salesResponse.json();

        if (!salesJson.success) {
          throw new Error(
            salesJson.error || "Unexpected response from sales endpoint"
          );
        }

        const summaryData: SalesSummary | null =
          salesJson.summary && typeof salesJson.summary === "object"
            ? {
                total_revenue: salesJson.summary.total_revenue,
                total_units_sold: Number(salesJson.summary.total_units_sold),
                total_transactions: Number(
                  salesJson.summary.total_transactions
                ),
                unique_customers: Number(
                  salesJson.summary.unique_customers
                ),
              }
            : null;

        const salesItems: SalesItem[] = Array.isArray(salesJson.data)
          ? salesJson.data.map((item: any) => ({
              product_color_id: Number(item.product_color_id),
              product_id: Number(item.product_id),
              product_name: item.product_name || "Unnamed Product",
              color: item.color || "Unknown",
              image_url: item.image_url || null,
              total_income: item.total_income || "0",
              total_quantity: Number(item.total_quantity || 0),
            }))
          : [];

        let topSales: TopProduct[] = salesItems.map((item, index) => ({
          rank: index + 1,
          productColorId: item.product_color_id,
          productId: item.product_id,
          productName: item.product_name,
          color: item.color,
          imageUrl: item.image_url,
          totalIncome: parseFloat(item.total_income) || 0,
          totalQuantity: item.total_quantity,
          availableQuantity: null,
        }));

        if (topSales.length > 0) {
          const uniqueProductIds = Array.from(
            new Set(topSales.map((item) => item.productId))
          );

          const stockResponses = await Promise.all(
            uniqueProductIds.map((productId) =>
              fetchTopProductStock(productId)
            )
          );

          const stockMap = stockResponses.reduce(
            (acc: Record<number, number>, current) => {
              Object.assign(acc, current);
              return acc;
            },
            {}
          );

          topSales = topSales.map((product) => ({
            ...product,
            availableQuantity:
              stockMap[product.productColorId] ?? product.availableQuantity,
          }));
        }

        if (!productCountResponse.ok) {
          throw new Error("Unable to load product count");
        }

        const productCountJson = await productCountResponse.json();

        const productCount =
          productCountJson?.pagination?.total !== undefined
            ? Number(productCountJson.pagination.total)
            : null;

        if (!isMounted) {
          return;
        }

        setSummary(summaryData);
        setTopProducts(topSales);
        setListedItems(productCount);
      } catch (fetchError: any) {
        if (!isMounted) {
          return;
        }
        console.error(fetchError);
        setError(
          fetchError?.message || "Something went wrong while loading data"
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const salesValue = summary ? formatCurrency(summary.total_revenue) : "—";
  const customerCount =
    summary && Number.isFinite(summary.unique_customers)
      ? summary.unique_customers
      : 0;
  const totalListed =
    listedItems !== null && Number.isFinite(listedItems) ? listedItems : 0;

  return (
    <div className="w-full grid grid-rows-[1fr_2fr] gap-4 p-4">
      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
        <Link
          href="/admin/sales"
          className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12 hover:shadow-xl ease-in duration-300"
        >
          <p className="font-display text-7xl font-bold">
            {loading ? (
              <span className="inline-block h-12 w-40 rounded bg-muted animate-pulse" />
            ) : (
              salesValue
            )}
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Sales</p>
            <p className="text-base text-muted-foreground">Year-To-Date</p>
          </div>
        </Link>
        <Link
          href="/admin/customers"
          className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12 hover:shadow-xl ease-in duration-300"
        >
          <p className="font-display text-7xl font-bold">
            {loading ? (
              <span className="inline-block h-12 w-28 rounded bg-muted animate-pulse" />
            ) : (
              customerCount
            )}
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Total Customers</p>
            <p className="text-base text-muted-foreground">Year-To-Date</p>
          </div>
        </Link>
        <Link
          href="/admin/products"
          className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12 hover:shadow-xl ease-in duration-300"
        >
          <p className="font-display text-7xl font-bold">
            {loading ? (
              <span className="inline-block h-12 w-28 rounded bg-muted animate-pulse" />
            ) : (
              totalListed
            )}
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Listed Shoes</p>
            <p className="text-base text-muted-foreground">Active Listings</p>
          </div>
        </Link>
      </div>

      <div className="w-full h-fit bg-white rounded-md flex flex-col overflow-hidden p-8">
        <div className="pb-6 flex items-center gap-3">
          <div className="aspect-square flex items-center justify-center rounded-md bg-neutral-100 p-2">
            <Trophy />
          </div>
          <p className="font-display text-xl font-bold">Top Sales Products</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead className="w-1/3">Product</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="w-28">Sales YTD</TableHead>
              <TableHead>Available Quantity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [1, 2, 3].map((index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <div className="h-16 w-full animate-pulse rounded bg-muted" />
                  </TableCell>
                </TableRow>
              ))
            ) : topProducts.length > 0 ? (
              topProducts.map((product) => (
                <TableRow key={product.productColorId}>
                  <TableCell>#{product.rank}</TableCell>
                  <TableCell>
                    <div className="flex gap-4 items-center">
                      <img
                        src={product.imageUrl || FALLBACK_IMAGE}
                        alt={`${product.productName} - ${product.color}`}
                        className="aspect-square w-16 rounded-sm object-cover bg-neutral-200"
                      />
                      <div className="flex flex-col">
                        <h1 className="text-base font-medium">
                          {product.productName}
                        </h1>
                        <span className="text-sm text-muted-foreground">
                          {product.color}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {product.productColorId}
                  </TableCell>
                  <TableCell className="font-display font-bold">
                    {formatCurrency(product.totalIncome)}
                  </TableCell>
                  <TableCell>
                    {product.availableQuantity !== null
                      ? `${product.availableQuantity} pcs`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon-sm">
                        <Edit />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-8 text-center text-muted-foreground"
                >
                  No sales data available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminHome;
