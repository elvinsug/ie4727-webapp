"use client";

import { useState } from "react";
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

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Mock transaction data for user
const mockTransactions = [
  {
    id: "TXN001",
    productName: "BRIDGE AUBERGINE",
    productImage: `${BASE_PATH}/product/mock-image-1.webp`,
    quantity: 1,
    price: 160.0,
    purchasedAt: new Date(2025, 10, 15),
  },
  {
    id: "TXN002",
    productName: "RUNNER BLUE",
    productImage: `${BASE_PATH}/product/mock-image-2.webp`,
    quantity: 2,
    price: 150.0,
    purchasedAt: new Date(2025, 10, 14),
  },
  {
    id: "TXN003",
    productName: "CLASSIC WHITE",
    productImage: `${BASE_PATH}/product/mock-image-1.webp`,
    quantity: 1,
    price: 140.0,
    purchasedAt: new Date(2025, 10, 12),
  },
  {
    id: "TXN004",
    productName: "URBAN BLACK",
    productImage: `${BASE_PATH}/product/mock-image-2.webp`,
    quantity: 1,
    price: 170.0,
    purchasedAt: new Date(2025, 10, 10),
  },
  {
    id: "TXN005",
    productName: "SPORT GREY",
    productImage: `${BASE_PATH}/product/mock-image-1.webp`,
    quantity: 3,
    price: 155.0,
    purchasedAt: new Date(2025, 10, 8),
  },
  {
    id: "TXN006",
    productName: "BRIDGE AUBERGINE",
    productImage: `${BASE_PATH}/product/mock-image-2.webp`,
    quantity: 1,
    price: 160.0,
    purchasedAt: new Date(2025, 9, 28),
  },
  {
    id: "TXN007",
    productName: "RUNNER BLUE",
    productImage: `${BASE_PATH}/product/mock-image-1.webp`,
    quantity: 2,
    price: 150.0,
    purchasedAt: new Date(2025, 9, 25),
  },
  {
    id: "TXN008",
    productName: "CLASSIC WHITE",
    productImage: `${BASE_PATH}/product/mock-image-2.webp`,
    quantity: 1,
    price: 140.0,
    purchasedAt: new Date(2025, 9, 20),
  },
  {
    id: "TXN009",
    productName: "URBAN BLACK",
    productImage: `${BASE_PATH}/product/mock-image-1.webp`,
    quantity: 1,
    price: 170.0,
    purchasedAt: new Date(2025, 9, 15),
  },
  {
    id: "TXN010",
    productName: "SPORT GREY",
    productImage: `${BASE_PATH}/product/mock-image-2.webp`,
    quantity: 2,
    price: 155.0,
    purchasedAt: new Date(2025, 9, 10),
  },
];

const UserPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);

  // Filter transactions based on search and date range
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch = transaction.productName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    const matchesDateRange =
      !dateRange ||
      !dateRange.from ||
      (transaction.purchasedAt >= dateRange.from &&
        (!dateRange.to || transaction.purchasedAt <= dateRange.to));

    return matchesSearch && matchesDateRange;
  });

  // Clear date range
  const handleClearDateRange = () => {
    setDateRange(undefined);
  };

  // Format date range for display
  const getDateRangeText = () => {
    if (!dateRange || !dateRange.from) return "Select Date Range";
    if (!dateRange.to) return format(dateRange.from, "MMM dd, yyyy");
    return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
      dateRange.to,
      "MMM dd, yyyy"
    )}`;
  };

  // Handle cancel/return order
  const handleCancelReturn = (transactionId: string) => {
    // TODO: Implement cancel/return logic
    if (confirm("Are you sure you want to cancel/return this order?")) {
      console.log("Canceling/Returning order:", transactionId);
      alert("Order cancellation/return request submitted");
    }
  };

  return (
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
              {/* Header */}
              <DialogHeader className="p-4 border-b flex items-center justify-between">
                <DialogTitle className="text-xl font-display font-bold">
                  Select Date Range
                </DialogTitle>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    size="icon-lg"
                    className="rounded-full"
                  >
                    <X />
                  </Button>
                </DialogClose>
              </DialogHeader>

              {/* Calendar */}
              <div className="p-4 flex items-center justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="rounded-md"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t bg-neutral-50 rounded-b-md flex gap-2 justify-end">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleClearDateRange}
                >
                  Clear
                </Button>
                <Button
                  size="lg"
                  onClick={() => setIsDateDialogOpen(false)}
                >
                  Apply
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Transactions Table */}
        <div className="flex-1 flex flex-col bg-white rounded-md overflow-hidden min-h-0">
          {/* Table Header */}
          <div className="shrink-0 border-b">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px] h-12 px-4">Product</TableHead>
                  <TableHead className="w-[100px]">Quantity</TableHead>
                  <TableHead className="w-[140px]">Price</TableHead>
                  <TableHead className="w-[180px]">Purchased At</TableHead>
                  <TableHead className="w-[180px]">Action</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>

          {/* Scrollable Table Body */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <Table className="table-fixed">
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="w-[300px] px-4">
                        <div className="flex gap-4 items-center py-1">
                          {transaction.productImage ? (
                            <img
                              src={transaction.productImage}
                              alt={transaction.productName}
                              className="aspect-square w-16 rounded-sm object-cover bg-neutral-200"
                            />
                          ) : (
                            <div className="aspect-square w-16 rounded-sm bg-neutral-300" />
                          )}
                          <div className="flex-1 min-w-0">
                            <h1 className="text-base font-medium truncate">
                              {transaction.productName}
                            </h1>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="w-[100px]">
                        <span className="text-sm font-medium">
                          {transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="w-[140px]">
                        <span className="text-base font-display font-bold">
                          S$
                          {transaction.price.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <span className="text-sm text-muted-foreground">
                          {format(transaction.purchasedAt, "MMM dd, yyyy")}
                        </span>
                      </TableCell>
                      <TableCell className="w-[180px]">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReturn(transaction.id)}
                          className="text-sm"
                        >
                          Cancel/Return Order
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No transactions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;