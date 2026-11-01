
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
};

type Sale = {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
};

function money(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
  }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DashboardContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResult, salesResult] = await Promise.all([
        supabase
          .from("products")
          .select("id, sku, name, price, stock_quantity, min_stock_level")
          .order("sku", { ascending: true }),

        supabase
          .from("sales")
          .select("id, order_number, status, total_amount, created_at")
          .order("created_at", { ascending: false }),
      ]);

      if (productResult.error) {
        throw new Error(productResult.error.message);
      }

      if (salesResult.error) {
        throw new Error(salesResult.error.message);
      }

      setProducts((productResult.data ?? []) as Product[]);
      setSales((salesResult.data ?? []) as Sale[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, [loadDashboard]);

  const lowStockProducts = products.filter(
    (product) => product.stock_quantity <= product.min_stock_level
  );

  const completedSales = sales.filter(
    (sale) => sale.status === "completed"
  );

  const totalRevenue = completedSales.reduce(
    (sum, sale) => sum + Number(sale.total_amount),
    0
  );

  const recentSales = sales.slice(0, 5);

  const statCards = [
    {
      label: "Total Products",
      value: loading ? "—" : products.length.toString(),
      note: "Products in your inventory",
      icon: "□",
      iconStyle: "bg-blue-50 text-blue-700",
    },
    {
      label: "Sales Revenue",
      value: loading ? "—" : money(totalRevenue),
      note: "Completed sales, all time",
      icon: "↗",
      iconStyle: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Low Stock Items",
      value: loading ? "—" : lowStockProducts.length.toString(),
      note: "At or below minimum stock",
      icon: "!",
      iconStyle: "bg-amber-50 text-amber-700",
    },
    {
      label: "Sales Orders",
      value: loading ? "—" : sales.length.toString(),
      note: "Orders recorded in the system",
      icon: "▤",
      iconStyle: "bg-violet-50 text-violet-700",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <Sidebar />

      <section className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">
              Workspace / Dashboard
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Dashboard
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Here&apos;s an overview of your shop&apos;s operations.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500">Business</p>
            <p className="text-sm font-semibold">Computer Shop</p>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <p className="font-semibold">Unable to load dashboard</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="mt-3 rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-slate-500">
                  {card.label}
                </p>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${card.iconStyle}`}
                >
                  {card.icon}
                </span>
              </div>

              <p className="mt-4 break-words text-2xl font-bold tracking-tight">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {card.note}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h3 className="font-bold">Recent Sales</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Latest recorded transactions
                </p>
              </div>

              <Link
                href="/sales"
                className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                View all sales →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Amount</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                        Loading sales...
                      </td>
                    </tr>
                  ) : recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-center text-slate-500">
                        No sales recorded yet.
                        <div className="mt-2">
                          <Link
                            href="/sales"
                            className="font-semibold text-blue-700 hover:underline"
                          >
                            Create your first sale
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-slate-50">
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {sale.order_number}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-600">
                          {formatDate(sale.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {money(Number(sale.total_amount))}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              sale.status === "completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : sale.status === "pending"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {sale.status.charAt(0).toUpperCase() +
                              sale.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-5">
              <div>
                <h3 className="font-bold">Inventory Overview</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Products requiring attention
                </p>
              </div>

              <Link
                href="/products"
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Products →
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <p className="p-5 text-sm text-slate-500">
                  Loading inventory...
                </p>
              ) : lowStockProducts.length === 0 ? (
                <p className="p-5 text-sm text-slate-500">
                  No low-stock products found.
                </p>
              ) : (
                lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between gap-3 p-5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        SKU: {product.sku}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {money(Number(product.price))} per unit
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-red-600">
                        {product.stock_quantity} units
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Minimum: {product.min_stock_level}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          StockWise · Inventory &amp; Sales Management
        </footer>
      </section>
    </main>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
