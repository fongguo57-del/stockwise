
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

type Product = {
  id: number;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
};

type Sale = {
  id: number;
  order_number: string;
  status: "pending" | "completed" | "cancelled";
  total_amount: number;
  created_at: string;
};

type CartItem = {
  productId: number;
  quantity: number;
};

const money = (value: number | string) =>
  `RM${Number(value).toFixed(2)}`;

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [productResult, salesResult] = await Promise.all([
        supabase
          .from("products")
          .select("id, sku, name, price, stock_quantity")
          .order("sku", { ascending: true }),

        supabase
          .from("sales")
          .select("id, order_number, status, total_amount, created_at")
          .order("created_at", { ascending: false })
          .limit(50),
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
          : "Unable to load sales data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.sku.toLowerCase().includes(term)
    );
  }, [products, search]);

  const cartDetails = useMemo(() => {
    return cart.map((item) => {
      const product = products.find(
        (p) => p.id === item.productId
      );

      return {
        ...item,
        product,
        subtotal: product
          ? Number(product.price) * item.quantity
          : 0,
      };
    });
  }, [cart, products]);

  const total = cartDetails.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  function addToCart(product: Product) {
    setError("");
    setSuccess("");

    if (product.stock_quantity <= 0) {
      setError(`${product.name} is out of stock.`);
      return;
    }

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product.id
      );

      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          setError(
            `Only ${product.stock_quantity} unit(s) of ${product.name} are available.`
          );
          return current;
        }

        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...current,
        { productId: product.id, quantity: 1 },
      ];
    });
  }

  function changeQuantity(productId: number, quantity: number) {
    setError("");
    setSuccess("");

    if (quantity <= 0) {
      setCart((current) =>
        current.filter((item) => item.productId !== productId)
      );
      return;
    }

    const product = products.find((p) => p.id === productId);

    if (
      !product ||
      !Number.isInteger(quantity) ||
      quantity > product.stock_quantity
    ) {
      setError(
        `Requested quantity exceeds available stock for ${
          product?.name ?? "this product"
        }.`
      );
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  }

  async function completeSale() {
    if (saving) return;

    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError("Add at least one product before completing a sale.");
      return;
    }

    setSaving(true);

    try {
      // Check the latest inventory before submitting.
      // The database function also performs its own stock validation.
      const { data: latestProducts, error: stockCheckError } =
        await supabase
          .from("products")
          .select("id, name, stock_quantity")
          .in(
            "id",
            cart.map((item) => item.productId)
          );

      if (stockCheckError) {
        setError(stockCheckError.message);
        return;
      }

      for (const item of cart) {
        const product = latestProducts?.find(
          (p) => p.id === item.productId
        );

        if (!product || item.quantity > product.stock_quantity) {
          setError(
            `${product?.name ?? "A selected product"} no longer has enough stock. Please review your cart.`
          );
          await loadData();
          return;
        }
      }

      const { data: saleId, error: saleError } =
        await supabase.rpc("create_sale", {
          p_items: cart.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
          })),
        });

      if (saleError) {
        setError(saleError.message);
        return;
      }

      if (saleId == null) {
        setError(
          "The sale may not have been created. Refresh the page and check Sales History before retrying."
        );
        return;
      }

      setCart([]);
      setSearch("");
      setSuccess(
        `Sale #${saleId} completed successfully. Inventory and stock movements have been updated.`
      );

      await loadData();
    } catch {
      setError(
        "Something went wrong. Check Sales History before retrying."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">
        <Sidebar />

        <section className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
          {/* Page heading */}
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-500">
                Workspace / Sales
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Sales Management
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Create sales, process orders, and track transactions.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading || saving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
            >
              Refresh Data
            </button>
          </header>

          {/* Feedback messages */}
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {success}
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              Loading products and sales...
            </div>
          ) : (
            <>
              {/* Product selection and current order */}
              <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                  <div className="mb-5">
                    <h2 className="text-xl font-semibold">
                      New Sale
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Select products to add them to the order.
                    </p>
                  </div>

                  <label
                    htmlFor="sales-search"
                    className="mb-2 block text-sm font-medium"
                  >
                    Search Products
                  </label>

                  <input
                    id="sales-search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search by name or SKU..."
                    className="mb-4 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  <div className="space-y-3">
                    {filteredProducts.map((product) => {
                      const selected = cart.find(
                        (item) => item.productId === product.id
                      );

                      const disabled =
                        product.stock_quantity <= 0 ||
                        (selected !== undefined &&
                          selected.quantity >= product.stock_quantity);

                      return (
                        <div
                          key={product.id}
                          className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-blue-200 sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="font-semibold">
                              {product.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              SKU: {product.sku}
                            </p>

                            <p className="mt-2 font-semibold text-slate-900">
                              {money(product.price)}
                            </p>

                            <p
                              className={`mt-1 text-xs ${
                                product.stock_quantity === 0
                                  ? "text-red-600"
                                  : product.stock_quantity <= 5
                                    ? "text-amber-600"
                                    : "text-green-700"
                              }`}
                            >
                              {product.stock_quantity} in stock
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={disabled || saving}
                            onClick={() => addToCart(product)}
                            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {product.stock_quantity === 0
                              ? "Out of Stock"
                              : disabled
                                ? "Max Quantity"
                                : "Add to Sale"}
                          </button>
                        </div>
                      );
                    })}

                    {filteredProducts.length === 0 && (
                      <div className="rounded-xl bg-slate-50 p-8 text-center">
                        <p className="font-medium text-slate-700">
                          No products found
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          Try a different product name or SKU.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Current order / cart */}
                <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 lg:sticky lg:top-6">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold">
                      Current Order
                    </h2>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                      {cart.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      unit(s)
                    </span>
                  </div>

                  {cartDetails.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                        +
                      </div>

                      <p className="font-medium text-slate-700">
                        Your order is empty
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Add a product to get started.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartDetails.map((item) => (
                        <div
                          key={item.productId}
                          className="border-b border-slate-100 pb-4 last:border-b-0"
                        >
                          <div className="flex justify-between gap-3">
                            <div>
                              <p className="font-medium">
                                {item.product?.name ?? "Product"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {money(item.product?.price ?? 0)} each
                              </p>
                            </div>

                            <p className="font-semibold">
                              {money(item.subtotal)}
                            </p>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <label
                              htmlFor={`quantity-${item.productId}`}
                              className="text-sm text-slate-600"
                            >
                              Quantity
                            </label>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                aria-label="Decrease quantity"
                                disabled={saving}
                                onClick={() =>
                                  changeQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                              >
                                −
                              </button>

                              <input
                                id={`quantity-${item.productId}`}
                                type="number"
                                min="1"
                                max={item.product?.stock_quantity}
                                step="1"
                                value={item.quantity}
                                disabled={saving}
                                onChange={(event) => {
                                  const value = event.target.value;

                                  if (value === "") return;

                                  changeQuantity(
                                    item.productId,
                                    Number(value)
                                  );
                                }}
                                className="w-16 rounded-lg border border-slate-200 px-2 py-1.5 text-center"
                              />

                              <button
                                type="button"
                                aria-label="Increase quantity"
                                disabled={
                                  saving ||
                                  !item.product ||
                                  item.quantity >=
                                    item.product.stock_quantity
                                }
                                onClick={() =>
                                  changeQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50"
                              >
                                +
                              </button>

                              <button
                                type="button"
                                disabled={saving}
                                onClick={() =>
                                  changeQuantity(item.productId, 0)
                                }
                                className="ml-1 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500">
                        Total Amount
                      </span>

                      <span className="text-2xl font-bold">
                        {money(total)}
                      </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Stock availability is checked before checkout.
                      The database validates the sale and updates inventory.
                    </p>

                    <button
                      type="button"
                      disabled={saving || cart.length === 0}
                      onClick={() => void completeSale()}
                      className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {saving ? "Processing Sale..." : "Complete Sale"}
                    </button>

                    <button
                      type="button"
                      disabled={saving || cart.length === 0}
                      onClick={() => {
                        setCart([]);
                        setError("");
                        setSuccess("");
                      }}
                      className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                      Clear Order
                    </button>
                  </div>
                </section>
              </div>

              {/* Sales history */}
              <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center md:p-6">
                  <div>
                    <h2 className="text-xl font-semibold">
                      Sales History
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your 50 most recent orders.
                    </p>
                  </div>

                  <span className="text-sm text-slate-500">
                    {sales.length} order(s)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px] text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-4 font-medium">
                          Order Number
                        </th>
                        <th className="px-5 py-4 font-medium">
                          Date
                        </th>
                        <th className="px-5 py-4 font-medium">
                          Status
                        </th>
                        <th className="px-5 py-4 text-right font-medium">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {sales.map((sale) => (
                        <tr
                          key={sale.id}
                          className="transition-colors hover:bg-slate-50"
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-medium">
                            {sale.order_number}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                            {new Date(
                              sale.created_at
                            ).toLocaleString()}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                sale.status === "completed"
                                  ? "bg-green-50 text-green-700"
                                  : sale.status === "cancelled"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {sale.status.charAt(0).toUpperCase() +
                                sale.status.slice(1)}
                            </span>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">
                            {money(sale.total_amount)}
                          </td>
                        </tr>
                      ))}

                      {sales.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="p-10 text-center text-slate-500"
                          >
                            No sales recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

          <footer className="mt-8 text-center text-xs text-slate-400">
            StockWise · Sales Management
          </footer>
        </section>
      </main>
    </AuthGuard>
  );
}
