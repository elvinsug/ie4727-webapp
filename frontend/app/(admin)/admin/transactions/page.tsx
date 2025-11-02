"use client";

import { useState } from "react";
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

// Mock transaction data
const mockTransactions = [
  {
    id: "TXN001",
    itemName: "Nike Air Max 270",
    color: "Black",
    size: "US 9",
    quantity: 1,
    purchasedBy: "John Doe",
    date: new Date(2025, 10, 1),
    amount: 162.0, // After 10% discount
  },
  {
    id: "TXN002",
    itemName: "Adidas Ultraboost 22",
    color: "White",
    size: "US 8",
    quantity: 2,
    purchasedBy: "Jane Smith",
    date: new Date(2025, 10, 2),
    amount: 323.0, // After 15% discount
  },
  {
    id: "TXN003",
    itemName: "New Balance 990v6",
    color: "Gray",
    size: "US 10",
    quantity: 1,
    purchasedBy: "Mike Johnson",
    date: new Date(2025, 10, 2),
    amount: 175.0,
  },
  {
    id: "TXN004",
    itemName: "Asics Gel-Kayano 29",
    color: "Blue",
    size: "US 7",
    quantity: 1,
    purchasedBy: "Sarah Williams",
    date: new Date(2025, 10, 3),
    amount: 128.0, // After 20% discount
  },
  {
    id: "TXN005",
    itemName: "Puma RS-X3",
    color: "Red",
    size: "US 9",
    quantity: 3,
    purchasedBy: "David Brown",
    date: new Date(2025, 10, 3),
    amount: 370.5, // After 5% discount
  },
  {
    id: "TXN006",
    itemName: "Reebok Nano X2",
    color: "Black",
    size: "US 8",
    quantity: 1,
    purchasedBy: "Emily Davis",
    date: new Date(2025, 10, 4),
    amount: 126.0, // After 10% discount
  },
  {
    id: "TXN007",
    itemName: "Hoka One One Clifton 8",
    color: "Orange",
    size: "US 10",
    quantity: 1,
    purchasedBy: "Chris Wilson",
    date: new Date(2025, 10, 5),
    amount: 150.0,
  },
  {
    id: "TXN008",
    itemName: "Saucony Endorphin Speed 2",
    color: "Green",
    size: "US 9",
    quantity: 2,
    purchasedBy: "Amanda Martinez",
    date: new Date(2025, 10, 5),
    amount: 255.0, // After 25% discount
  },
  {
    id: "TXN009",
    itemName: "Brooks Ghost 14",
    color: "Purple",
    size: "US 8",
    quantity: 1,
    purchasedBy: "Robert Taylor",
    date: new Date(2025, 10, 6),
    amount: 126.0, // After 10% discount
  },
  {
    id: "TXN010",
    itemName: "Mizuno Wave Rider 25",
    color: "Blue",
    size: "US 7",
    quantity: 1,
    purchasedBy: "Lisa Anderson",
    date: new Date(2025, 10, 7),
    amount: 114.75, // After 15% discount
  },
  {
    id: "TXN011",
    itemName: "Under Armour HOVR Phantom 2",
    color: "Black",
    size: "US 9",
    quantity: 2,
    purchasedBy: "Kevin Thomas",
    date: new Date(2025, 10, 8),
    amount: 240.0, // After 20% discount
  },
  {
    id: "TXN012",
    itemName: "On Cloudflow",
    color: "White",
    size: "US 10",
    quantity: 1,
    purchasedBy: "Michelle Jackson",
    date: new Date(2025, 10, 9),
    amount: 145.0,
  },
];

type SortField = "date" | "amount" | null;
type SortDirection = "asc" | "desc";

const AdminTransactions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field with default desc direction
      setSortField(field);
      setSortDirection("desc");
    }
  };

  // Filter transactions based on search and date range
  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.purchasedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.color.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDateRange =
      !dateRange ||
      !dateRange.from ||
      (transaction.date >= dateRange.from &&
        (!dateRange.to || transaction.date <= dateRange.to));

    return matchesSearch && matchesDateRange;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    if (sortField === "date") {
      comparison = a.date.getTime() - b.date.getTime();
    } else if (sortField === "amount") {
      comparison = a.amount - b.amount;
    }

    return sortDirection === "asc" ? comparison : -comparison;
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

  return (
    <div className="w-full h-screen flex flex-col gap-4 p-4">
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
                <TableHead className="w-[240px] h-12 px-4">Item Name</TableHead>
                <TableHead className="w-[100px]">Color</TableHead>
                <TableHead className="w-[100px]">Size</TableHead>
                <TableHead className="w-[80px]">Qty</TableHead>
                <TableHead className="w-[200px]">Purchased By</TableHead>
                <TableHead className="w-[140px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("date")}
                  >
                    Date
                    {sortField === "date" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("amount")}
                  >
                    Amount
                    {sortField === "amount" ? (
                      sortDirection === "asc" ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                      )
                    ) : (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        {/* Scrollable Table Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <Table className="table-fixed">
            <TableBody>
              {sortedTransactions.length > 0 ? (
                sortedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="w-[240px] px-4">
                      <div className="truncate">
                        <h1 className="text-base font-medium">
                          {transaction.itemName}
                        </h1>
                      </div>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <span className="text-sm">{transaction.color}</span>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <span className="text-sm font-medium">
                        {transaction.size}
                      </span>
                    </TableCell>
                    <TableCell className="w-[80px]">
                      <span className="text-sm font-medium">
                        {transaction.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="truncate">
                        <span className="text-sm">{transaction.purchasedBy}</span>
                      </div>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <span className="text-sm text-muted-foreground">
                        {format(transaction.date, "MMM dd, yyyy")}
                      </span>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <span className="text-base font-display font-bold">
                        $
                        {transaction.amount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
  );
};

export default AdminTransactions;

