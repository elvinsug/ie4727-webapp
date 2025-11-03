"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, RefreshCcw } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const FALLBACK_IMAGE = `${BASE_PATH}/product/mock-image-1.webp`;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const currencyCompactFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat("en-US");

const toNumber = (value: unknown) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const toInt = (value: unknown) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.round(numeric) : 0;
};

const toDate = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const formatCurrency = (value: number | null | undefined) => {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return currencyFormatter.format(numeric);
};

const formatCurrencyCompact = (value: number | null | undefined) => {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return currencyCompactFormatter.format(numeric);
};

const formatInteger = (value: number | null | undefined) => {
  const numeric = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return integerFormatter.format(numeric);
};

const getDisplayDate = (value: Date | null) =>
  value ? format(value, "MMM d, yyyy") : "—";

const buildChartLabel = (name: string, color: string) => {
  const label = `${name} (${color})`;
  return label.length > 32 ? `${label.slice(0, 29)}…` : label;
};

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

type SortOption = "income" | "quantity";
type SortOrder = "asc" | "desc";

type SalesSummary = {
  totalRevenue: number;
  totalUnitsSold: number;
  totalTransactions: number;
  uniqueCustomers: number;
};

type SalesReportItem = {
  productColorId: number;
  productId: number;
  productName: string;
  color: string;
  imageUrl: string | null;
  sex: string | null;
  type: string | null;
  totalQuantity: number;
  totalIncome: number;
  transactionCount: number;
  avgPricePaid: number;
  firstSale: Date | null;
  lastSale: Date | null;
};

type RawSalesReportItem = {
  product_color_id?: number | string;
  product_id?: number | string;
  product_name?: string;
  color?: string;
  image_url?: string | null;
  sex?: string | null;
  type?: string | null;
  total_quantity?: number | string;
  total_income?: number | string;
  transaction_count?: number | string;
  avg_price_paid?: number | string;
  first_sale_date?: string | null;
  last_sale_date?: string | null;
};

type SalesReportResponse = {
  success: boolean;
  data?: RawSalesReportItem[];
  summary?: {
    total_revenue?: number | string;
    total_units_sold?: number | string;
    total_transactions?: number | string;
    unique_customers?: number | string;
  };
  pagination?: {
    limit?: number;
    offset?: number;
    total?: number | string;
  };
  error?: string;
};

const AdminSales = () => {
  const [salesData, setSalesData] = useState<SalesReportItem[]>([]);
  const [summary, setSummary] = useState<SalesSummary | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("income");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          sort: sortBy,
          order: sortOrder,
          limit: String(limit),
          offset: String(offset),
        });

        const response = await fetch(
          `${API_URL}/transactions/sales_report.php?${params.toString()}`,
          {
            credentials: "include",
            signal,
          }
        );

        const json = (await response.json()) as SalesReportResponse;

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to load sales report");
        }

        if (signal?.aborted) {
          return;
        }

        const mappedItems: SalesReportItem[] = Array.isArray(json.data)
          ? json.data.map((item) => ({
              productColorId: toInt(item.product_color_id),
              productId: toInt(item.product_id),
              productName: item.product_name ?? "Unnamed product",
              color: item.color ?? "N/A",
              imageUrl: item.image_url ?? null,
              sex: item.sex ?? null,
              type: item.type ?? null,
              totalQuantity: toInt(item.total_quantity),
              totalIncome: toNumber(item.total_income),
              transactionCount: toInt(item.transaction_count),
              avgPricePaid: toNumber(item.avg_price_paid),
              firstSale: toDate(item.first_sale_date),
              lastSale: toDate(item.last_sale_date),
            }))
          : [];

        const summaryData: SalesSummary | null = json?.summary
          ? {
              totalRevenue: toNumber(json.summary.total_revenue),
              totalUnitsSold: toInt(json.summary.total_units_sold),
              totalTransactions: toInt(json.summary.total_transactions),
              uniqueCustomers: toInt(json.summary.unique_customers),
            }
          : null;

        setSalesData(mappedItems);
        setSummary(summaryData);
        setTotal(toInt(json?.pagination?.total));
      } catch (reportError: unknown) {
        if (signal?.aborted) {
          return;
        }

        const message =
          reportError instanceof Error
            ? reportError.message
            : "Failed to load sales report";
        setError(message);
        setSalesData([]);
        setSummary(null);
        setTotal(0);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [limit, offset, sortBy, sortOrder]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchReport(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchReport]);

  const handleRefresh = () => {
    fetchReport();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption);
    setOffset(0);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    setOffset(0);
  };

  const handleLimitChange = (value: string) => {
    const numericValue = Number(value);
    setLimit(Number.isFinite(numericValue) ? numericValue : 10);
    setOffset(0);
  };

  const handlePreviousPage = () => {
    setOffset((prev) => Math.max(0, prev - limit));
  };

  const handleNextPage = () => {
    setOffset((prev) => {
      const nextOffset = prev + limit;
      return nextOffset >= total ? prev : nextOffset;
    });
  };

  const chartData = useMemo(
    () =>
      salesData.slice(0, 8).map((item) => ({
        label: buildChartLabel(item.productName, item.color),
        fullLabel: `${item.productName} (${item.color})`,
        revenue: item.totalIncome,
        units: item.totalQuantity,
      })),
    [salesData]
  );

  const totalPages = total > 0 && limit > 0 ? Math.ceil(total / limit) : 1;
  const currentPage = total > 0 && limit > 0 ? Math.floor(offset / limit) + 1 : 1;
  const hasPrevious = offset > 0;
  const hasNext = offset + limit < total;
  const rangeStart = total === 0 ? 0 : offset + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(total, offset + salesData.length);

  const averageOrderValue =
    summary && summary.totalTransactions
      ? summary.totalRevenue / Math.max(summary.totalTransactions, 1)
      : 0;

  const unitsPerTransaction =
    summary && summary.totalTransactions
      ? summary.totalUnitsSold / Math.max(summary.totalTransactions, 1)
      : 0;

  const revenuePerCustomer =
    summary && summary.uniqueCustomers
      ? summary.totalRevenue / Math.max(summary.uniqueCustomers, 1)
      : 0;

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Sales Report</h1>
            <p className="text-sm text-muted-foreground">
              Track revenue, volume, and product performance for completed
              transactions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[160px] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Revenue</SelectItem>
                <SelectItem value="quantity">Units Sold</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortOrder}
              className="bg-white"
            >
              {sortOrder === "asc" ? (
                <ArrowUp className="mr-2 h-4 w-4" />
              ) : (
                <ArrowDown className="mr-2 h-4 w-4" />
              )}
              {sortOrder === "asc" ? "Ascending" : "Descending"}
            </Button>
            <Select value={String(limit)} onValueChange={handleLimitChange}>
              <SelectTrigger className="w-[140px] bg-white">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50, 100].map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="bg-white"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCcw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {isLoading && !summary ? (
                  <span className="inline-block h-8 w-32 rounded bg-muted animate-pulse" />
                ) : (
                  formatCurrency(summary?.totalRevenue ?? 0)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {summary?.totalTransactions
                  ? `${formatInteger(summary.totalTransactions)} transactions`
                  : "Awaiting transactions"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardDescription>Units Sold</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {isLoading && !summary ? (
                  <span className="inline-block h-8 w-24 rounded bg-muted animate-pulse" />
                ) : (
                  formatInteger(summary?.totalUnitsSold ?? 0)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {summary?.totalTransactions
                  ? `${unitsPerTransaction.toFixed(1)} avg units / transaction`
                  : "No completed orders yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardDescription>Unique Customers</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {isLoading && !summary ? (
                  <span className="inline-block h-8 w-20 rounded bg-muted animate-pulse" />
                ) : (
                  formatInteger(summary?.uniqueCustomers ?? 0)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {summary?.uniqueCustomers
                  ? `${formatCurrency(revenuePerCustomer)} revenue / customer`
                  : "No customer activity yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardDescription>Average Order Value</CardDescription>
              <CardTitle className="text-3xl font-semibold">
                {isLoading && !summary ? (
                  <span className="inline-block h-8 w-28 rounded bg-muted animate-pulse" />
                ) : (
                  formatCurrency(averageOrderValue)
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {summary?.totalTransactions
                  ? `${formatInteger(summary.totalTransactions)} completed orders`
                  : "Refresh once orders come in"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white">
          <CardHeader className="flex flex-col gap-1 border-b py-4">
            <CardTitle className="text-2xl">Top Products</CardTitle>
            <CardDescription>
              Leading styles ranked by {sortBy === "income" ? "revenue" : "units sold"}.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pt-6 sm:px-6">
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[320px] w-full">
                <BarChart data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={80}
                    tickFormatter={(value) => formatCurrencyCompact(Number(value))}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(_, payload) =>
                          (payload?.[0]?.payload?.fullLabel as string) ?? "Product"
                        }
                        formatter={(value, _name, _item, _index, payload) => {
                          const numericValue = Array.isArray(value)
                            ? Number(value[0] ?? 0)
                            : typeof value === "number"
                            ? value
                            : Number(value ?? 0);

                          const unitsSold =
                            payload && typeof payload === "object"
                              ? Number(
                                  (payload as { units?: number }).units ?? 0
                                )
                              : 0;

                          return (
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {formatCurrency(numericValue)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatInteger(unitsSold)} units sold
                              </span>
                            </div>
                          );
                        }}
                      />
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="var(--color-revenue)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
                {isLoading
                  ? "Loading sales insights..."
                  : "No sales data available for the selected range."}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader className="flex flex-col gap-1 border-b py-4">
            <CardTitle className="text-2xl">Sales by Product Variant</CardTitle>
            <CardDescription>
              Detailed breakdown of completed orders grouped by product color
              option.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[240px]">Product</TableHead>
                    <TableHead className="min-w-[160px]">Category</TableHead>
                    <TableHead className="min-w-[120px] text-right">
                      Units Sold
                    </TableHead>
                    <TableHead className="min-w-[140px] text-right">
                      Revenue
                    </TableHead>
                    <TableHead className="min-w-[140px] text-right">
                      Avg. Price
                    </TableHead>
                    <TableHead className="min-w-[140px] text-right">
                      Transactions
                    </TableHead>
                    <TableHead className="min-w-[160px]">Last Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && salesData.length === 0
                    ? Array.from({ length: Math.min(limit, 8) }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell colSpan={7}>
                            <div className="h-14 w-full animate-pulse rounded bg-muted" />
                          </TableCell>
                        </TableRow>
                      ))
                    : salesData.length > 0
                    ? salesData.map((item) => (
                        <TableRow key={item.productColorId}>
                          <TableCell>
                            <div className="flex items-center gap-4">
                              <img
                                src={item.imageUrl || FALLBACK_IMAGE}
                                alt={`${item.productName} - ${item.color}`}
                                className="h-14 w-14 rounded-md object-cover"
                              />
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                  #{item.productColorId} • {item.color}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {item.sex ? (
                                <Badge variant="secondary" className="capitalize">
                                  {item.sex}
                                </Badge>
                              ) : null}
                              {item.type ? (
                                <Badge variant="outline" className="capitalize">
                                  {item.type}
                                </Badge>
                              ) : null}
                              <Badge variant="outline">ID: {item.productId}</Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatInteger(item.totalQuantity)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {formatCurrency(item.totalIncome)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.avgPricePaid)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatInteger(item.transactionCount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span>{getDisplayDate(item.lastSale)}</span>
                              <span className="text-xs text-muted-foreground">
                                First: {getDisplayDate(item.firstSale)}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No sales data available. Try refreshing or adjusting the
                            filters.
                          </TableCell>
                        </TableRow>
                      )}
                </TableBody>
              </Table>
            </div>
            <div className="flex flex-col gap-2 border-t px-6 py-4 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
              <div>
                {total > 0 ? (
                  <span>
                    Showing {rangeStart}–{rangeEnd} of {formatInteger(total)} variants
                  </span>
                ) : (
                  <span>No matching records</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!hasPrevious || isLoading}
                >
                  Previous
                </Button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasNext || isLoading}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSales;
