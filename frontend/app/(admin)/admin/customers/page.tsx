"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/miona/api";

type SortField = "registeredAt" | "totalSpent" | null;
type SortDirection = "asc" | "desc";

type CustomerRecord = {
  id: number;
  email: string;
  createdAt: string;
  totalSpent: number;
  completedOrders: number;
  firstPurchaseAt: string | null;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: number) =>
  currencyFormatter.format(Number.isFinite(value) ? value : 0);

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return format(parsed, "MMM d, yyyy");
};

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_URL}/admin/users.php?role=user`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Failed to load customers");
        }

        if (!isMounted) {
          return;
        }

        const mapped: CustomerRecord[] = Array.isArray(data.users)
          ? data.users.map((user: any) => ({
              id: Number(user.id),
              email: String(user.email ?? ""),
              createdAt: String(user.created_at ?? ""),
              totalSpent: Number(user.total_spent ?? 0),
              completedOrders: Number(user.completed_orders ?? 0),
              firstPurchaseAt: user.first_purchase_at ?? null,
            }))
          : [];

        setCustomers(mapped);
      } catch (fetchError: any) {
        if (controller.signal.aborted || !isMounted) {
          return;
        }
        setError(fetchError?.message || "Failed to load customers");
        setCustomers([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const filteredCustomers = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) {
      return customers;
    }
    return customers.filter((customer) =>
      customer.email.toLowerCase().includes(search)
    );
  }, [customers, searchQuery]);

  const sortedCustomers = useMemo(() => {
    if (!sortField) {
      return filteredCustomers;
    }

    const list = [...filteredCustomers];

    list.sort((a, b) => {
      let comparison = 0;

      if (sortField === "registeredAt") {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        comparison = dateA - dateB;
      } else if (sortField === "totalSpent") {
        comparison = a.totalSpent - b.totalSpent;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return list;
  }, [filteredCustomers, sortField, sortDirection]);

  return (
    <div className="w-full h-screen flex flex-col gap-4 p-4">
      <div className="shrink-0 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search customers by email..."
          className="h-12 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="text-sm text-muted-foreground">
          {filteredCustomers.length} customer
          {filteredCustomers.length === 1 ? "" : "s"}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex-1 bg-white rounded-md overflow-hidden min-h-0">
        <div className="h-full overflow-y-auto">
          <Table className="table-fixed w-full">
            <TableHeader className="sticky top-0 z-10 bg-white shadow-[inset_0_-1px_0_0_rgba(0,0,0,0.08)]">
              <TableRow>
                <TableHead className="w-[320px] h-12 px-4">Email</TableHead>
                <TableHead className="w-[200px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("registeredAt")}
                  >
                    Registered At
                    {sortField === "registeredAt" ? (
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
                <TableHead className="w-[200px] text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("totalSpent")}
                  >
                    Total Spending
                    {sortField === "totalSpent" ? (
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
                <TableHead className="w-[160px] text-right">
                  Orders
                </TableHead>
                <TableHead className="w-[220px] pr-4">
                  First Purchase
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell colSpan={5}>
                      <div className="h-12 w-full animate-pulse rounded bg-muted" />
                    </TableCell>
                  </TableRow>
                ))
              ) : sortedCustomers.length > 0 ? (
                sortedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="w-[320px] px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium">{customer.email}</span>
                        <span className="text-xs text-muted-foreground">
                          ID: {customer.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    <TableCell className="w-[200px] text-right font-semibold">
                      {formatCurrency(customer.totalSpent)}
                    </TableCell>
                    <TableCell className="w-[160px] text-right">
                      {customer.completedOrders}
                    </TableCell>
                    <TableCell className="w-[220px] pr-4">
                      {formatDate(customer.firstPurchaseAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    {error
                      ? "Unable to load customers."
                      : "No customers match your search."}
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

export default AdminCustomers;
