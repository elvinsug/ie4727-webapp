"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock sales data for the past year
const generateSalesData = () => {
  const data = [];
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2025-11-02");

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    const sales = Math.floor(Math.random() * 5000) + 1000; // Random sales between $1000-$6000
    const items = Math.floor(sales / 150); // Average item price ~$150
    data.push({
      date: dateStr,
      sales: sales,
      items: items,
    });
  }
  return data;
};

const chartData = generateSalesData();

const chartConfig = {
  sales: {
    label: "Sales ($)",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

const AdminSales = () => {
  const [timeRange, setTimeRange] = React.useState("max");

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2025-11-02");
    let daysToSubtract = chartData.length; // max

    switch (timeRange) {
      case "7d":
        daysToSubtract = 7;
        break;
      case "30d":
        daysToSubtract = 30;
        break;
      case "90d":
        daysToSubtract = 90;
        break;
      case "180d":
        daysToSubtract = 180;
        break;
      case "365d":
        daysToSubtract = 365;
        break;
      default:
        daysToSubtract = chartData.length;
    }

    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [timeRange]);

  // Calculate totals
  const totalSales = React.useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.sales, 0);
  }, [filteredData]);

  const totalItems = React.useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.items, 0);
  }, [filteredData]);

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case "7d":
        return "Last 7 days";
      case "30d":
        return "Last 30 days";
      case "90d":
        return "Last 3 months";
      case "180d":
        return "Last 6 months";
      case "365d":
        return "Last year";
      default:
        return "All time";
    }
  };

  return (
    <div className="w-full h-screen grid grid-rows-[1fr_2fr] gap-4 p-4">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12">
          <p className="font-display text-7xl font-bold">
            $
            {totalSales.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Total Sales</p>
            <p className="text-base text-muted-foreground">
              {getTimeRangeLabel()}
            </p>
          </div>
        </div>

        <div className="w-full h-full bg-white rounded-md flex flex-col justify-between p-12">
          <p className="font-display text-7xl font-bold">
            {totalItems.toLocaleString("en-US")}
          </p>
          <div className="flex flex-col gap-1">
            <p className="font-display text-2xl">Items Sold</p>
            <p className="text-base text-muted-foreground">
              {getTimeRangeLabel()}
            </p>
          </div>
        </div>
      </div>

      {/* Chart Row */}
      <Card className="w-full">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-4xl">Sales Overview</CardTitle>
            <CardDescription>
              Showing total sales for {getTimeRangeLabel().toLowerCase()}
            </CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="w-[180px] rounded-lg"
              aria-label="Select time range"
            >
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="180d" className="rounded-lg">
                Last 6 months
              </SelectItem>
              <SelectItem value="365d" className="rounded-lg">
                Last year
              </SelectItem>
              <SelectItem value="max" className="rounded-lg">
                All time
              </SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[400px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-sales)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-sales)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    formatter={(value) => {
                      return `$${Number(value).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`;
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="sales"
                type="natural"
                fill="url(#fillSales)"
                stroke="var(--color-sales)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSales;

