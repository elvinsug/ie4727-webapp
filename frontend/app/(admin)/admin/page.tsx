import { Edit, Eye, Trash, Trophy } from "lucide-react";
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

const AdminHome = () => {
  return (
    <div className="w-ful grid grid-rows-[1fr_2fr] gap-4 p-4">
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
        <Link
          href="/admin/sales"
          className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12 hover:shadow-xl ease-in duration-300"
        >
          <p className="font-display text-7xl font-bold">$100,000</p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Sales</p>
            <p className="text-base text-muted-foreground">Year-To-Date</p>
          </div>
        </Link>
        <Link
          href="/admin/customers"
          className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12 hover:shadow-xl ease-in duration-300"
        >
          <p className="font-display text-7xl font-bold">16</p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Total Customers</p>
            <p className="text-base text-muted-foreground">Year-To-Date</p>
          </div>
        </Link>
        <Link
          href="/admin/products"
          className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12 hover:shadow-xl ease-in duration-300"
        >
          <p className="font-display text-7xl font-bold">40</p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Listed Shoes</p>
            <p className="text-base text-muted-foreground">Year-To-Date</p>
          </div>
        </Link>
      </div>

      {/* Top Sales Products */}
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
              <TableHead className="">Available Quantity</TableHead>
              <TableHead className="">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>#1</TableCell>
              <TableCell>
                <div className="flex gap-4 items-center">
                  <div className="aspect-square w-16 rounded-sm bg-neutral-500" />
                  <h1 className="text-base font-medium">Nike Air Max 270</h1>
                </div>
              </TableCell>
              <TableCell>1234567890</TableCell>
              <TableCell className="font-display font-bold">
                $12,450.00
              </TableCell>
              <TableCell>42 pcs</TableCell>
              <TableCell className="">
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
            <TableRow>
              <TableCell>#2</TableCell>
              <TableCell>
                <div className="flex gap-4 items-center">
                  <div className="aspect-square w-16 rounded-sm bg-neutral-400" />
                  <h1 className="text-base font-medium">Adidas Ultraboost 22</h1>
                </div>
              </TableCell>
              <TableCell>0987654321</TableCell>
              <TableCell className="font-display font-bold">
                $8,920.00
              </TableCell>
              <TableCell>28 pcs</TableCell>
              <TableCell className="">
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
            <TableRow>
              <TableCell>#3</TableCell>
              <TableCell>
                <div className="flex gap-4 items-center">
                  <div className="aspect-square w-16 rounded-sm bg-neutral-600" />
                  <h1 className="text-base font-medium">New Balance 990v6</h1>
                </div>
              </TableCell>
              <TableCell>5647382910</TableCell>
              <TableCell className="font-display font-bold">
                $7,350.00
              </TableCell>
              <TableCell>15 pcs</TableCell>
              <TableCell className="">
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
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminHome;
