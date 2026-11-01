
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

type StockMovement = {
  id: number;
  product_id: number;
  movement_type: "stock_in" | "sale" | "adjustment";
  quantity: number;
  notes: string | null;
  created_at: string;
  products: {
    sku: string;
    name: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
};

export default function StockMovementsPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadMovements() {
      setLoading(true);
      setError("");

      try {
        const { data, error } = await supabase
          .from("stock_movements")
          .select(`
            id,
            product_id,
            movement_type,
            quantity,
            notes,
            created_at,
            products (sku, name),
            profiles:created_by (full_name)
          `)
          .order("created_at", { ascending: false });

        if (!active) return;

        if (error) {
          setError(error.message);
        } else {
          setMovements((data ?? []) as unknown as StockMovement[]);
        }
      } catch {
        if (active) {
          setError(
            "An unexpected error occurred while loading stock movements."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadMovements();

    return () => {
      active = false;
    };
  }, []);

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString();
  }

  function getMovementLabel(type: StockMovement["movement_type"]) {
    switch (type) {
      case "stock_in":
        return "Stock In";
      case "sale":
        return "Sale";
      case "adjustment":
        return "Stock Adjustment";
      default:
        return type;
    }
  }

  function getMovementStyle(type: StockMovement["movement_type"]) {
    switch (type) {
      case "stock_in":
        return "bg-green-50 text-green-700";
      case "sale":
        return "bg-blue-50 text-blue-700";
      case "adjustment":
        return "bg-amber-50 text-amber-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">
        <Sidebar />

        <section className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
          <header className="mb-8">
            <p className="text-sm text-slate-500">
              Workspace / Inventory
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Stock Movement History
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Track stock-in, sales, and stock adjustment activities.
            </p>
          </header>

          {/* Summary cards */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Total Movements
              </p>
              <p className="mt-2 text-3xl font-bold">
                {loading ? "—" : error ? "—" : movements.length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Recorded inventory activities
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Stock In
              </p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {loading || error
                  ? "—"
                  : movements.filter(
                      (movement) => movement.movement_type === "stock_in"
                    ).length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Recorded stock-in transactions
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">
                Sales Movements
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-700">
                {loading || error
                  ? "—"
                  : movements.filter(
                      (movement) => movement.movement_type === "sale"
                    ).length}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Recorded stock deductions from sales
              </p>
            </div>
          </div>

          {/* Movement history */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-semibold">
                  Movement Records
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest activities appear first.
                </p>
              </div>

              {!loading && !error && (
                <span className="text-sm text-slate-500">
                  {movements.length} record(s)
                </span>
              )}
            </div>

            {/* Loading state */}
            {loading && (
              <div
                role="status"
                className="p-10 text-center text-slate-500"
              >
                Loading stock movements...
              </div>
            )}

            {/* Error state */}
            {!loading && error && (
              <div
                role="alert"
                className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <p className="font-semibold">
                  Failed to load stock movement history
                </p>
                <p className="mt-1">{error}</p>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && movements.length === 0 && (
              <div className="p-10 text-center">
                <div
                  aria-hidden="true"
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500"
                >
                  ⇄
                </div>

                <h3 className="font-semibold">
                  No stock movements yet
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Stock-in, sales, and adjustments will appear here
                  when recorded.
                </p>
              </div>
            )}

            {/* Movement table */}
            {!loading && !error && movements.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="whitespace-nowrap px-5 py-4 font-medium">
                        Date &amp; Time
                      </th>
                      <th className="px-5 py-4 font-medium">SKU</th>
                      <th className="px-5 py-4 font-medium">Product</th>
                      <th className="px-5 py-4 font-medium">Movement</th>
                      <th className="px-5 py-4 font-medium">Quantity</th>
                      <th className="px-5 py-4 font-medium">Staff</th>
                      <th className="px-5 py-4 font-medium">Notes</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {movements.map((movement) => (
                      <tr
                        key={movement.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(movement.created_at)}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-medium">
                          {movement.products?.sku ?? "—"}
                        </td>

                        <td className="min-w-40 px-5 py-4">
                          <span className="font-medium text-slate-800">
                            {movement.products?.name ?? "Unknown product"}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getMovementStyle(
                              movement.movement_type
                            )}`}
                          >
                            {getMovementLabel(movement.movement_type)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold">
                          {movement.quantity}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {movement.profiles?.full_name ?? "Unknown staff"}
                        </td>

                        <td className="min-w-40 px-5 py-4 text-slate-600">
                          {movement.notes || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <footer className="mt-8 text-center text-xs text-slate-400">
            StockWise · Inventory Management
          </footer>
        </section>
      </main>
    </AuthGuard>
  );
}
