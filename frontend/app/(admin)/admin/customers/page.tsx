"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
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

// Mock customer data
const mockCustomers = [
  {
    id: "CUST001",
    name: "John Doe",
    email: "john.doe@example.com",
    joinedDate: new Date(2024, 0, 15),
  },
  {
    id: "CUST002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    joinedDate: new Date(2024, 1, 22),
  },
  {
    id: "CUST003",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    joinedDate: new Date(2024, 2, 10),
  },
  {
    id: "CUST004",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    joinedDate: new Date(2024, 2, 18),
  },
  {
    id: "CUST005",
    name: "David Brown",
    email: "david.brown@example.com",
    joinedDate: new Date(2024, 3, 5),
  },
  {
    id: "CUST006",
    name: "Emily Davis",
    email: "emily.davis@example.com",
    joinedDate: new Date(2024, 3, 28),
  },
  {
    id: "CUST007",
    name: "Chris Wilson",
    email: "chris.wilson@example.com",
    joinedDate: new Date(2024, 4, 12),
  },
  {
    id: "CUST008",
    name: "Amanda Martinez",
    email: "amanda.martinez@example.com",
    joinedDate: new Date(2024, 5, 3),
  },
  {
    id: "CUST009",
    name: "Robert Taylor",
    email: "robert.taylor@example.com",
    joinedDate: new Date(2024, 5, 20),
  },
  {
    id: "CUST010",
    name: "Lisa Anderson",
    email: "lisa.anderson@example.com",
    joinedDate: new Date(2024, 6, 8),
  },
  {
    id: "CUST011",
    name: "Kevin Thomas",
    email: "kevin.thomas@example.com",
    joinedDate: new Date(2024, 7, 14),
  },
  {
    id: "CUST012",
    name: "Michelle Jackson",
    email: "michelle.jackson@example.com",
    joinedDate: new Date(2024, 8, 25),
  },
  {
    id: "CUST013",
    name: "James White",
    email: "james.white@example.com",
    joinedDate: new Date(2024, 9, 2),
  },
  {
    id: "CUST014",
    name: "Patricia Harris",
    email: "patricia.harris@example.com",
    joinedDate: new Date(2024, 9, 18),
  },
  {
    id: "CUST015",
    name: "Daniel Martin",
    email: "daniel.martin@example.com",
    joinedDate: new Date(2024, 10, 5),
  },
];

type SortField = "memberSince" | null;
type SortDirection = "asc" | "desc";

const AdminCustomers = () => {
  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter customers based on search
  const filteredCustomers = mockCustomers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Sort customers
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (!sortField) return 0;

    let comparison = 0;

    if (sortField === "memberSince") {
      comparison = a.joinedDate.getTime() - b.joinedDate.getTime();
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  return (
    <div className="w-full h-screen flex flex-col gap-4 p-4">
      {/* Search */}
      <div className="shrink-0 flex items-center gap-2">
        <Input
          type="text"
          placeholder="Search customers..."
          className="h-12 bg-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Customers Table */}
      <div className="flex-1 flex flex-col bg-white rounded-md overflow-hidden min-h-0">
        {/* Table Header */}
        <div className="shrink-0 border-b">
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[240px] h-12 px-4">Customer Name</TableHead>
                <TableHead className="w-[280px]">Email</TableHead>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-ml-3 h-8 font-medium"
                    onClick={() => handleSort("memberSince")}
                  >
                    Member Since
                    {sortField === "memberSince" ? (
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
              {sortedCustomers.length > 0 ? (
                sortedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="w-[240px] px-4">
                      <div className="truncate">
                        <h1 className="text-base font-medium">
                          {customer.name}
                        </h1>
                      </div>
                    </TableCell>
                    <TableCell className="w-[280px]">
                      <span className="text-sm text-muted-foreground">
                        {customer.email}
                      </span>
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <span className="text-sm">
                        {format(customer.joinedDate, "MMM dd, yyyy")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="h-32 text-center text-muted-foreground"
                  >
                    No customers found
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

