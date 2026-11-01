
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

type Sale = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

type SaleItem = {
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  line_total: number | null;
};

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
};

type Period = "7" | "30" | "all";

function money(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value);
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
  });
}

function ReportsContent() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState<Period>("30");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [salesResult, itemsResult, productsResult] =
        await Promise.all([
          supabase
            .from("sales")
            .select(
              "id, order_number, status, total_amount, created_at"
            )
            .order("created_at", { ascending: false }),

          supabase
            .from("sale_items")
            .select(
              "sale_id, product_id, quantity, unit_price, line_total"
            ),

          supabase
            .from("products")
            .select("id, sku, name, price, stock_quantity")
            .order("name", { ascending: true }),
        ]);

      if (salesResult.error) {
        throw new Error(salesResult.error.message);
      }

      if (itemsResult.error) {
        throw new Error(itemsResult.error.message);
      }

      if (productsResult.error) {
        throw new Error(productsResult.error.message);
      }

      setSales((salesResult.data ?? []) as Sale[]);
      setSaleItems((itemsResult.data ?? []) as SaleItem[]);
      setProducts((productsResult.data ?? []) as Product[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load report data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReports();
  }, [loadReports]);

  const report = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (period === "7") {
      start.setDate(start.getDate() - 6);
    } else if (period === "30") {
      start.setDate(start.getDate() - 29);
    }

    start.setHours(0, 0, 0, 0);

    const inPeriod = (date: string) =>
      period === "all" || new Date(date) >= start;

    const periodSales = sales.filter((sale) =>
      inPeriod(sale.created_at)
    );

    const completedSales = periodSales.filter(
      (sale) => sale.status === "completed"
    );

    const completedIds = new Set(
      completedSales.map((sale) => sale.id)
    );

    const relevantItems = saleItems.filter((item) =>
      completedIds.has(item.sale_id)
    );

    const revenue = completedSales.reduce(
      (sum, sale) => sum + Number(sale.total_amount),
      0
    );

    const averageOrderValue =
      completedSales.length > 0
        ? revenue / completedSales.length
        : 0;

    const soldByProduct = new Map<
      number,
      { quantity: number; revenue: number }
    >();

    relevantItems.forEach((item) => {
      const existing = soldByProduct.get(item.product_id) ?? {
        quantity: 0,
        revenue: 0,
      };

      existing.quantity += Number(item.quantity);
      existing.revenue +=
        item.line_total == null
          ? Number(item.quantity) * Number(item.unit_price)
          : Number(item.line_total);

      soldByProduct.set(item.product_id, existing);
    });

    const productMap = new Map(
      products.map((product) => [product.id, product])
    );

    const topProducts = Array.from(soldByProduct.entries())
      .map(([productId, stats]) => ({
        product: productMap.get(productId),
        quantity: stats.quantity,
        revenue: stats.revenue,
      }))
      .filter((item) => item.product)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    const inventoryValue = products.reduce(
      (sum, product) =>
        sum +
        Number(product.price) * Number(product.stock_quantity),
      0
    );

    const days: { label: string; revenue: number }[] = [];
    const dayCount = period === "7" ? 7 : 30;

    if (period !== "all") {
      for (let i = dayCount - 1; i >= 0; i--) {
        const day = new Date(now);
        day.setHours(0, 0, 0, 0);
        day.setDate(day.getDate() - i);

        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const dailyRevenue = completedSales
          .filter((sale) => {
            const date = new Date(sale.created_at);
            return date >= day && date < nextDay;
          })
          .reduce(
            (sum, sale) => sum + Number(sale.total_amount),
            0
          );

        days.push({
          label: dateLabel(day.toISOString()),
          revenue: dailyRevenue,
        });
      }
    }

    return {
      periodSales,
      completedSales,
      revenue,
      averageOrderValue,
      inventoryValue,
      topProducts,
      days,
    };
  }, [sales, saleItems, products, period]);

  const maxDailyRevenue = Math.max(
    ...report.days.map((day) => day.revenue),
    1
  );

  function exportCsv() {
    const headers = [
      "Order Number",
      "Date",
      "Status",
      "Total Amount (MYR)",
    ];

    const rows = report.periodSales.map((sale) => [
      sale.order_number,
      new Date(sale.created_at).toISOString(),
      sale.status,
      Number(sale.total_amount).toFixed(2),
    ]);

    const escapeCsv = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `stockwise-sales-report-${
      period === "all" ? "all-time" : `last-${period}-days`
    }.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <Sidebar />

      <section className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Workspace / Reports
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
              Reports &amp; Analytics
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Understand sales performance and inventory value.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(event) =>
                setPeriod(event.target.value as Period)
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-label="Report date range"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="all">All time</option>
            </select>

            <button
              type="button"
              onClick={exportCsv}
              disabled={loading || report.periodSales.length === 0}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↓ Export CSV
            </button>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Unable to load reports</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => void loadReports()}
              className="mt-3 rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Sales Revenue",
              value: money(report.revenue),
              note: "Completed sales in selected period",
              icon: "↗",
            },
            {
              label: "Completed Orders",
              value: String(report.completedSales.length),
              note: "Successfully completed sales",
              icon: "✓",
            },
            {
              label: "Average Order Value",
              value: money(report.averageOrderValue),
              note: "Revenue per completed order",
              icon: "◎",
            },
            {
              label: "Inventory Value",
              value: money(report.inventoryValue),
              note: "Current stock × current product price",
              icon: "□",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  {card.label}
                </p>

                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-700">
                  {card.icon}
                </span>
              </div>

              <p className="mt-4 break-words text-2xl font-bold tracking-tight">
                {loading ? "—" : card.value}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {card.note}
              </p>
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-6">
              <h3 className="font-bold">Sales Trend</h3>

              <p className="mt-1 text-xs text-slate-500">
                Daily completed-sales revenue
                {period === "all"
                  ? " is available in the order report below."
                  : ` over the last ${period} days.`}
              </p>
            </div>

            {loading ? (
              <div className="flex h-56 items-center justify-center text-sm text-slate-500">
                Loading sales trend...
              </div>
            ) : period === "all" ? (
              <div className="flex h-56 items-center justify-center text-center text-sm text-slate-500">
                Select the last 7 or 30 days to view the daily chart.
              </div>
            ) : (
              <>
                <div className="flex h-56 items-end gap-1.5 sm:gap-2">
                  {report.days.map((day, index) => (
                    <div
                      key={`${day.label}-${index}`}
                      className="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <div className="pointer-events-none absolute bottom-full z-10 mb-2 hidden whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1.5 text-xs text-white shadow-lg group-hover:block">
                        <p>{day.label}</p>
                        <p className="font-semibold">
                          {money(day.revenue)}
                        </p>
                      </div>

                      <div
                        title={`${day.label}: ${money(day.revenue)}`}
                        className="w-full max-w-8 rounded-t-md bg-blue-500 transition hover:bg-blue-600"
                        style={{
                          height: `${Math.max(
                            (day.revenue / maxDailyRevenue) * 100,
                            2
                          )}%`,
                          minHeight: "3px",
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between gap-1 border-t border-slate-100 pt-3 text-xs text-slate-400">
                  <span>{report.days[0]?.label}</span>
                  <span>
                    {report.days[report.days.length - 1]?.label}
                  </span>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h3 className="font-bold">Top-Selling Products</h3>

              <p className="mt-1 text-xs text-slate-500">
                Ranked by units sold in completed orders
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <p className="p-5 text-sm text-slate-500">
                  Loading products...
                </p>
              ) : report.topProducts.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  No completed sales with product items found for this period.
                </p>
              ) : (
                report.topProducts.map((item, index) => (
                  <div
                    key={item.product!.id}
                    className="flex items-center gap-3 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.product!.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.product!.sku}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold">
                        {item.quantity} sold
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {money(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
            <div>
              <h3 className="font-bold">Sales Transactions</h3>

              <p className="mt-1 text-xs text-slate-500">
                Orders recorded during the selected period
              </p>
            </div>

            <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
              {loading
                ? "Loading..."
                : `${report.periodSales.length} orders`}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">
                    Order Number
                  </th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">
                    Amount
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : report.periodSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-slate-500"
                    >
                      No sales found for this period.

                      <div className="mt-2">
                        <Link
                          href="/sales"
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          Go to Sales
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  report.periodSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 font-medium">
                        {sale.order_number}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {new Date(sale.created_at).toLocaleString("en-MY")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            sale.status === "completed"
                              ? "bg-blue-50 text-blue-700"
                              : sale.status === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {sale.status.charAt(0).toUpperCase() +
                            sale.status.slice(1)}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right font-medium">
                        {money(Number(sale.total_amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="text-center text-xs text-slate-400">
          StockWise · Reports &amp; Analytics
        </footer>
      </section>
    </main>
  );
}

export default function ReportsPage() {
  return (
    <AuthGuard>
      <ReportsContent />
    </AuthGuard>
  );
}
