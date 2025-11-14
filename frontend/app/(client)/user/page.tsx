"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import Image from "next/image";
import { useAlertDialog } from "@/hooks/useAlertDialog";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

type Transaction = {
  id: number;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  purchasedAt: Date | null;
  status: string;
  paymentMethod: string | null;
};

const UserPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showAlert, alertDialog } = useAlertDialog();

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      if (dateRange?.from) {
        params.set("start_date", dateRange.from.toISOString());
      }

      if (dateRange?.to) {
        params.set("end_date", dateRange.to.toISOString());
      }

      const response = await fetch(
        `${API_URL}/transactions/get_user_transactions.php?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to fetch transactions");
      }

      const mapped: Transaction[] = (data.transactions || []).map(
        (transaction: any) => {
          const image =
            transaction.product?.images?.[0] ??
            `${BASE_PATH}/product/mock-image-1.webp`;

          const dateValue = transaction.transaction_date
            ? new Date(transaction.transaction_date)
            : null;

          return {
            id: transaction.id,
            productName: transaction.product?.name ?? "Unknown product",
            productImage: image,
            quantity: Number(transaction.quantity ?? 0),
            price: Number(transaction.price_paid ?? 0),
            purchasedAt:
              dateValue && !isNaN(dateValue.getTime()) ? dateValue : null,
            status: transaction.status ?? "completed",
            paymentMethod: transaction.payment_method ?? null,
          };
        }
      );

      setTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const filteredTransactions = useMemo(() => {
    const loweredQuery = searchQuery.toLowerCase().trim();
    const hasDateFilter = Boolean(dateRange?.from);

    const startDate = dateRange?.from
      ? new Date(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate(),
          0,
          0,
          0,
          0
        )
      : null;

    const endDate = dateRange?.to
      ? new Date(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate(),
          23,
          59,
          59,
          999
        )
      : startDate;

    const startTime = startDate ? startDate.getTime() : null;
    const endTime = endDate ? endDate.getTime() : null;

    return transactions.filter((transaction) => {
      const matchesSearch =
        !loweredQuery ||
        transaction.productName.toLowerCase().includes(loweredQuery);

      if (!matchesSearch) {
        return false;
      }

      if (!hasDateFilter) {
        return true;
      }

      if (!transaction.purchasedAt) {
        return false;
      }

      const purchaseTime = transaction.purchasedAt.getTime();
      const afterStart = startTime !== null ? purchaseTime >= startTime : true;
      const beforeEnd = endTime !== null ? purchaseTime <= endTime : true;

      return afterStart && beforeEnd;
    });
  }, [transactions, searchQuery, dateRange]);

  const handleClearDateRange = () => {
    setDateRange(undefined);
  };

  const getDateRangeText = () => {
    if (!dateRange || !dateRange.from) return "Select Date Range";
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
    return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
      dateRange.to,
      "MMM dd, yyyy"
    )}`;
  };

  const handleCancelReturn = (transactionId: number) => {
    // TODO: Implement cancel/return logic
    if (confirm("Are you sure you want to cancel/return this order?")) {
      console.log("Canceling/Returning order:", transactionId);
      showAlert({
        title: "Request Submitted",
        description: "Order cancellation/return request submitted.",
      });
    }
  };

  return (
    <>
      {alertDialog}
      <div className="mt-[88px] w-screen p-8">
        <div className="h-[calc(100vh-88px-64px)] mx-auto max-w-7xl flex flex-col gap-4">
          <h1 className="font-display text-3xl font-semibold">
            My Transaction History
          </h1>

          {/* Search and Filter */}
          <div className="shrink-0 flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search transactions..."
              className="h-12 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              variant={dateRange?.from ? "default" : "outline"}
              className="h-12 min-w-[240px]"
              onClick={() => setIsDateDialogOpen(true)}
            >
              <CalendarIcon className="w-4 h-4" />
              <p className="pr-2">{getDateRangeText()}</p>
              {dateRange?.from && (
                <X
                  className="w-4 h-4 ml-auto"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDateRange();
                  }}
                />
              )}
            </Button>
            <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
              <DialogContent
                showCloseButton={false}
                className="max-w-[400px] p-0 flex flex-col"
              >
                <DialogHeader className="p-4 border-b flex items-center justify-between">
                  <DialogTitle className="text-xl font-display font-bold">
                    Select Date Range
                  </DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon">
                      <X className="w-5 h-5" />
                    </Button>
                  </DialogClose>
                </DialogHeader>

                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                  className="mx-auto my-4"
                />

                <div className="flex justify-end gap-2 px-4 py-3 border-t">
                  <Button variant="ghost" onClick={handleClearDateRange}>
                    Clear
                  </Button>
                  <DialogClose asChild>
                    <Button onClick={fetchTransactions}>Apply</Button>
                  </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Transactions Table */}
        <div className="flex-1 bg-white border rounded-lg overflow-hidden">
          {isLoading && transactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              Loading transactions...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              No transactions found.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-neutral-50">
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {`TXN${String(transaction.id).padStart(6, "0")}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-neutral-100">
                          {transaction.productImage ? (
                            <Image
                              src={transaction.productImage}
                              alt={transaction.productName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{transaction.productName}</p>
                          {transaction.paymentMethod && (
                            <p className="text-xs text-gray-500 capitalize">
                              {transaction.paymentMethod}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>
                      S${transaction.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaction.purchasedAt ? (
                        <div className="flex flex-col">
                          <span>{format(transaction.purchasedAt, "MMM d, yyyy")}</span>
                          <span className="text-xs text-gray-500">
                            {format(transaction.purchasedAt, "h:mm a")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="capitalize">
                      {transaction.status}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelReturn(transaction.id)}
                      >
                        Cancel / Return
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default UserPage;
