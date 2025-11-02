"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

type TransactionRecord = {
  id: number;
  code: string;
  itemName: string;
  color: string;
  size: string;
  quantity: number;
  purchasedBy: string;
  date: Date | null;
  amount: number;
  status: string;
  paymentMethod: string | null;
};

type SortField = "date" | "amount" | null;
type SortDirection = "asc" | "desc";

const AdminTransactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/transactions/get_transactions.php`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Failed to fetch transactions");
      }

      const mapped: TransactionRecord[] = (data.transactions || []).map((transaction: any) => {
        const dateValue = transaction.transaction_date ? new Date(transaction.transaction_date) : null;

        return {
          id: transaction.id,
          code:
            transaction.transaction_code ??
            `TXN${String(transaction.id ?? "").padStart(6, "0")}`,
          itemName: transaction.product?.name ?? "Unknown product",
          color: transaction.product?.color ?? "N/A",
          size: transaction.product?.size ?? "N/A",
          quantity: Number(transaction.quantity ?? 0),
          purchasedBy: transaction.user?.email ?? "Unknown customer",
          date: dateValue && !isNaN(dateValue.getTime()) ? dateValue : null,
          amount: Number(transaction.total_amount ?? 0),
          status: transaction.status ?? "completed",
          paymentMethod: transaction.payment_method ?? null,
        };
      });

      setTransactions(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch transactions");
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredTransactions = useMemo(() => {
    const loweredQuery = searchQuery.toLowerCase().trim();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !loweredQuery ||
        transaction.itemName.toLowerCase().includes(loweredQuery) ||
        transaction.purchasedBy.toLowerCase().includes(loweredQuery) ||
        transaction.color.toLowerCase().includes(loweredQuery) ||
        transaction.code.toLowerCase().includes(loweredQuery);

      const transactionDate = transaction.date;
      const matchesDateRange =
        !dateRange ||
        !dateRange.from ||
        (transactionDate &&
          transactionDate >= dateRange.from &&
          (!dateRange.to || transactionDate <= dateRange.to));

      return matchesSearch && matchesDateRange;
    });
  }, [transactions, searchQuery, dateRange]);

  const sortedTransactions = useMemo(() => {
    if (!sortField) {
      return filteredTransactions;
    }

    const list = [...filteredTransactions];

    return list.sort((a, b) => {
      let comparison = 0;

      if (sortField === "date") {
        const dateA = a.date ? a.date.getTime() : 0;
        const dateB = b.date ? b.date.getTime() : 0;
        comparison = dateA - dateB;
      } else if (sortField === "amount") {
        comparison = a.amount - b.amount;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredTransactions, sortField, sortDirection]);

  const resetFilters = () => {
    setSearchQuery("");
    setDateRange(undefined);
    setSortField(null);
    setSortDirection("desc");
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Transactions</h1>
            <p className="text-sm text-gray-500">View and manage recent transactions from the store</p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search by product, buyer, or color"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full md:w-72"
            />
            <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
              <Button
                variant="outline"
                onClick={() => setIsDateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from
                  ? `${format(dateRange.from, "MMM d, yyyy")} ${
                      dateRange?.to ? `- ${format(dateRange.to, "MMM d, yyyy")}` : ""
                    }`
                  : "Select dates"}
              </Button>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Select date range</DialogTitle>
                </DialogHeader>
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                    Clear
                  </Button>
                  <DialogClose asChild>
                    <Button size="sm">Apply</Button>
                  </DialogClose>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-lg font-semibold">Filters</h2>
                <p className="text-sm text-gray-500">
                  Narrow down your search by time period or keywords
                </p>
              </div>
              <Button variant="ghost" className="flex items-center gap-2" onClick={resetFilters}>
                <X className="h-4 w-4" />
                Clear filters
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={isLoading}>
                {isLoading ? "Refreshing..." : "Refresh"}
              </Button>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-gray-500">
              Showing {sortedTransactions.length} transaction
              {sortedTransactions.length === 1 ? "" : "s"}
            </span>
            {dateRange?.from && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>
                  {format(dateRange.from, "MMM d, yyyy")} -{" "}
                  {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : "Present"}
                </span>
                <button
                  className="p-1 rounded-full hover:bg-neutral-100"
                  onClick={() => setDateRange(undefined)}
                  aria-label="Clear date range"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg overflow-hidden">
          {isLoading && transactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">Loading transactions...</div>
          ) : sortedTransactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No transactions match your current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Purchased By</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      {sortField === "date" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => handleSort("amount")}
                  >
                    <div className="flex items-center gap-2">
                      Amount
                      {sortField === "amount" ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-4 w-4" />
                        ) : (
                          <ArrowDown className="h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.itemName}</p>
                        {transaction.status && (
                          <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.color}</TableCell>
                    <TableCell>{transaction.size}</TableCell>
                    <TableCell>{transaction.quantity}</TableCell>
                    <TableCell>{transaction.purchasedBy}</TableCell>
                    <TableCell>
                      {transaction.date ? (
                        <div className="flex flex-col">
                          <span>{format(transaction.date, "MMMM d, yyyy")}</span>
                          <span className="text-xs text-gray-500">
                            {format(transaction.date, "h:mm a")}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">No date</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold">S${transaction.amount.toFixed(2)}</span>
                        {transaction.paymentMethod && (
                          <span className="text-xs text-gray-500 capitalize">
                            {transaction.paymentMethod}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
