"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PieLabelRenderProps } from "recharts";

// Mock data for charts
const revenueData = [
  { month: "Jan", revenue: 2400000, target: 2200000 },
  { month: "Feb", revenue: 1800000, target: 2200000 },
  { month: "Mar", revenue: 2600000, target: 2200000 },
  { month: "Apr", revenue: 2200000, target: 2200000 },
  { month: "May", revenue: 2800000, target: 2200000 },
  { month: "Jun", revenue: 3200000, target: 2200000 },
];

const workOrderData = [
  { month: "Jan", completed: 45, pending: 12, cancelled: 3 },
  { month: "Feb", completed: 52, pending: 8, cancelled: 2 },
  { month: "Mar", completed: 48, pending: 15, cancelled: 5 },
  { month: "Apr", completed: 61, pending: 10, cancelled: 1 },
  { month: "May", completed: 55, pending: 18, cancelled: 4 },
  { month: "Jun", completed: 67, pending: 14, cancelled: 2 },
];

const companyDistribution = [
  { name: "PT NILO", value: 45, color: "#0088FE" },
  { name: "PT ZTA", value: 25, color: "#00C49F" },
  { name: "PT TAM", value: 20, color: "#FFBB28" },
  { name: "PT HTK", value: 10, color: "#FF8042" },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function OverviewCharts() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="workorders">Work Orders</TabsTrigger>
            <TabsTrigger value="distribution">Company Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value / 1000000}M`} />
                  <Tooltip
                    formatter={(value: number) => [`Rp ${(value / 1000000).toFixed(1)}M`, ""]}
                    labelFormatter={(label) => `Month: ${label}`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                    name="Actual Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke="#ff7300"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="workorders" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workOrderData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" stackId="a" fill="#22c55e" name="Completed" />
                  <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                  <Bar dataKey="cancelled" stackId="a" fill="#ef4444" name="Cancelled" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={companyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: PieLabelRenderProps) => {
                      const { name, percent } = props;
                      const pct = typeof percent === "number" ? (percent * 100).toFixed(0) : "0";
                      return `${name ?? ""} ${pct}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {companyDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
