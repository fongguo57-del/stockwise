
"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

type Product = {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  min_stock_level: number;
};

type StockMovementType = "stock_in" | "adjustment";

const PRODUCT_FIELDS =
  "id, sku, name, description, price, stock_quantity, min_stock_level";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    stock_quantity: "0",
    min_stock_level: "5",
  });

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [editForm, setEditForm] = useState({
    sku: "",
    name: "",
    description: "",
    price: "",
    min_stock_level: "0",
  });

  const [deletingProductId, setDeletingProductId] =
    useState<number | null>(null);

  const [stockProduct, setStockProduct] =
    useState<Product | null>(null);
  const [stockMovementType, setStockMovementType] =
    useState<StockMovementType>("stock_in");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [stockNotes, setStockNotes] = useState("");
  const [stockError, setStockError] = useState("");
  const [adjustingStock, setAdjustingStock] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRole() {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          if (active) setIsAdmin(false);
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("role")
            .eq("id", authData.user.id)
            .maybeSingle();

        if (active) {
          setIsAdmin(!profileError && profile?.role === "admin");
        }
      } catch {
        if (active) setIsAdmin(false);
      }
    }

    void loadRole();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select(PRODUCT_FIELDS)
          .order("sku", { ascending: true });

        if (!active) return;

        if (error) {
          setError(error.message);
        } else {
          setProducts((data ?? []) as Product[]);
        }
      } catch {
        if (active) {
          setError("Unable to load products. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  function sortProducts(items: Product[]) {
    return [...items].sort((a, b) =>
      a.sku.localeCompare(b.sku, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  }

  async function handleAddProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setFormError("");

    if (!isAdmin) {
      setFormError("Only administrators can add products.");
      return;
    }

    const price = Number(form.price);
    const stock = Number(form.stock_quantity);
    const minimum = Number(form.min_stock_level);

    if (
      !form.sku.trim() ||
      !form.name.trim() ||
      !form.price.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stock) ||
      stock < 0 ||
      !Number.isInteger(minimum) ||
      minimum < 0
    ) {
      setFormError(
        "Enter a valid SKU, name, price, and non-negative whole-number stock quantities."
      );
      return;
    }

    setSaving(true);

    try {
      const { data: productId, error } = await supabase.rpc(
        "create_product_with_initial_stock",
        {
          p_sku: form.sku.trim(),
          p_name: form.name.trim(),
          p_description: form.description.trim() || null,
          p_price: price,
          p_stock_quantity: stock,
          p_min_stock_level: minimum,
        }
      );

      if (error) {
        setFormError(
          error.code === "23505"
            ? "This SKU already exists. Please enter a unique SKU."
            : error.message
        );
        return;
      }

      if (productId == null) {
        setFormError(
          "The product could not be saved. Please try again."
        );
        return;
      }

      const { data: newProduct, error: fetchError } =
        await supabase
          .from("products")
          .select(PRODUCT_FIELDS)
          .eq("id", productId)
          .single();

      if (fetchError || !newProduct) {
        setFormError(
          "The product was created, but its details could not be loaded. Please refresh the page."
        );
        return;
      }

      setProducts((current) =>
        sortProducts([...current, newProduct as Product])
      );

      setForm({
        sku: "",
        name: "",
        description: "",
        price: "",
        stock_quantity: "0",
        min_stock_level: "5",
      });

      setShowAddForm(false);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function openEditModal(product: Product) {
    if (!isAdmin) return;

    setEditingProduct(product);
    setEditForm({
      sku: product.sku,
      name: product.name,
      description: product.description ?? "",
      price: String(product.price),
      min_stock_level: String(product.min_stock_level),
    });
    setFormError("");
  }

  async function handleUpdateProduct(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingProduct || !isAdmin) return;

    setFormError("");

    const price = Number(editForm.price);
    const minimum = Number(editForm.min_stock_level);

    if (
      !editForm.sku.trim() ||
      !editForm.name.trim() ||
      !editForm.price.trim() ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(minimum) ||
      minimum < 0
    ) {
      setFormError(
        "Enter a valid SKU, name, price, and non-negative whole-number minimum stock level."
      );
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          sku: editForm.sku.trim(),
          name: editForm.name.trim(),
          description: editForm.description.trim() || null,
          price,
          min_stock_level: minimum,
        })
        .eq("id", editingProduct.id)
        .select(PRODUCT_FIELDS);

      if (error) {
        setFormError(error.message);
        return;
      }

      if (!data || data.length === 0) {
        setFormError(
          "The product was not updated. You may not have permission."
        );
        return;
      }

      const updatedProduct = data[0] as Product;

      setProducts((current) =>
        sortProducts(
          current.map((product) =>
            product.id === updatedProduct.id
              ? updatedProduct
              : product
          )
        )
      );

      setEditingProduct(null);
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProduct(product: Product) {
    if (!isAdmin || deletingProductId !== null) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}" (${product.sku})?`
    );

    if (!confirmed) return;

    setDeletingProductId(product.id);

    try {
      const { data, error } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id)
        .select("id");

      if (error) {
        if (error.code === "23503") {
          window.alert(
            "This product cannot be deleted because it is referenced by other records, such as a sale."
          );
        } else {
          window.alert(`Unable to delete product: ${error.message}`);
        }
        return;
      }

      if (!data || data.length === 0) {
        window.alert(
          "Unable to delete product. You may not have permission to perform this action."
        );
        return;
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
    } catch {
      window.alert(
        "Something went wrong while deleting the product."
      );
    } finally {
      setDeletingProductId(null);
    }
  }

  async function handleStockAdjustment(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!stockProduct) return;

    const quantity = Number(stockQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setStockError("Quantity must be a positive whole number.");
      return;
    }

    if (
      stockMovementType === "adjustment" &&
      quantity > stockProduct.stock_quantity
    ) {
      setStockError("Quantity cannot exceed the current stock.");
      return;
    }

    setStockError("");
    setAdjustingStock(true);

    try {
      const { error } = await supabase.rpc(
        "adjust_product_stock",
        {
          p_product_id: stockProduct.id,
          p_movement_type: stockMovementType,
          p_quantity: quantity,
          p_notes: stockNotes.trim() || null,
        }
      );

      if (error) {
        setStockError(error.message);
        return;
      }

      const { data, error: refreshError } = await supabase
        .from("products")
        .select("id, stock_quantity")
        .eq("id", stockProduct.id)
        .single();

      if (refreshError || !data) {
        setStockProduct(null);
        setStockQuantity("1");
        setStockNotes("");
        setStockError("");
        window.alert(
          "Stock was adjusted, but the latest quantity could not be loaded. Please refresh the page."
        );
        return;
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === stockProduct.id
            ? {
                ...product,
                stock_quantity: data.stock_quantity,
              }
            : product
        )
      );

      setStockProduct(null);
      setStockQuantity("1");
      setStockNotes("");
      setStockError("");
    } catch {
      setStockError(
        "Something went wrong while adjusting stock."
      );
    } finally {
      setAdjustingStock(false);
    }
  }

  const filteredProducts = products.filter((product) => {
    const term = search.toLowerCase().trim();

    return (
      product.name.toLowerCase().includes(term) ||
      product.sku.toLowerCase().includes(term)
    );
  });

  return (
    <AuthGuard>
      <main className="min-h-screen bg-slate-50 text-slate-900 md:flex">
        <Sidebar />

        <section className="min-w-0 flex-1 p-5 md:p-8 lg:p-10">
          <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-slate-500">
                Workspace / Products
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Products
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Manage and monitor your inventory products.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setFormError("");
                  setShowAddForm(true);
                }}
                className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                + Add Product
              </button>
            )}
          </header>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label
              htmlFor="product-search"
              className="mb-2 block font-medium"
            >
              Search Products
            </label>

            <input
              id="product-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by product name or SKU..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
            />

            <p className="mt-3 text-sm text-slate-500">
              {filteredProducts.length} product(s) found.
            </p>
          </div>

          {showAddForm && isAdmin && (
            <form
              onSubmit={handleAddProduct}
              className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-xl font-semibold">
                Add New Product
              </h2>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                >
                  {formError}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium">
                  SKU *
                  <input
                    required
                    maxLength={50}
                    value={form.sku}
                    onChange={(event) =>
                      setForm({ ...form, sku: event.target.value })
                    }
                    placeholder="e.g. ACC-005"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Product Name *
                  <input
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Product name"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Price (RM) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="89.90"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Initial Stock *
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock_quantity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        stock_quantity: event.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Minimum Stock Level *
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.min_stock_level}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        min_stock_level: event.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block text-sm font-medium">
                  Description
                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Optional description"
                    rows={2}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => {
                    setShowAddForm(false);
                    setFormError("");
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {editingProduct && isAdmin && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onMouseDown={(event) => {
                if (
                  event.target === event.currentTarget &&
                  !saving
                ) {
                  setEditingProduct(null);
                  setFormError("");
                }
              }}
            >
              <form
                onSubmit={handleUpdateProduct}
                className="max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      Edit Product
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Update {editingProduct.sku}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setEditingProduct(null);
                      setFormError("");
                    }}
                    className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                    aria-label="Close edit window"
                  >
                    ✕
                  </button>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  >
                    {formError}
                  </p>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium">
                    SKU *
                    <input
                      required
                      maxLength={50}
                      value={editForm.sku}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          sku: event.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Product Name *
                    <input
                      required
                      maxLength={150}
                      value={editForm.name}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          name: event.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Price (RM) *
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={editForm.price}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          price: event.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>

                  <label className="block text-sm font-medium">
                    Minimum Stock Level *
                    <input
                      required
                      type="number"
                      min="0"
                      step="1"
                      value={editForm.min_stock_level}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          min_stock_level: event.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>

                  <label className="block text-sm font-medium sm:col-span-2">
                    Description
                    <textarea
                      rows={3}
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          description: event.target.value,
                        })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                    />
                  </label>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => {
                      setEditingProduct(null);
                      setFormError("");
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {stockProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <form
                onSubmit={handleStockAdjustment}
                className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
              >
                <div>
                  <h2 className="text-xl font-bold">
                    Adjust Stock
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {stockProduct.name} ({stockProduct.sku})
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Current stock: {stockProduct.stock_quantity}
                  </p>
                </div>

                {stockError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
                  >
                    {stockError}
                  </p>
                )}

                <label className="block text-sm font-medium">
                  Movement Type
                  <select
                    value={stockMovementType}
                    onChange={(event) =>
                      setStockMovementType(
                        event.target.value as StockMovementType
                      )
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                    disabled={adjustingStock}
                  >
                    <option value="stock_in">
                      Stock In — Increase quantity
                    </option>
                    <option value="adjustment">
                      Adjustment — Decrease quantity
                    </option>
                  </select>
                </label>

                <label className="block text-sm font-medium">
                  Quantity
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={stockQuantity}
                    onChange={(event) =>
                      setStockQuantity(event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                    disabled={adjustingStock}
                  />
                </label>

                <label className="block text-sm font-medium">
                  Notes (optional)
                  <textarea
                    value={stockNotes}
                    onChange={(event) =>
                      setStockNotes(event.target.value)
                    }
                    maxLength={500}
                    rows={3}
                    placeholder="e.g. New stock received from supplier"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                    disabled={adjustingStock}
                  />
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    disabled={adjustingStock}
                    onClick={() => {
                      setStockProduct(null);
                      setStockError("");
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={adjustingStock}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {adjustingStock ? "Saving..." : "Save Adjustment"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              Loading products...
            </div>
          ) : error ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700"
            >
              Failed to load products: {error}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="p-4 font-medium">SKU</th>
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Stock</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product) => {
                    const lowStock =
                      product.stock_quantity <=
                      product.min_stock_level;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap p-4 font-medium">
                          {product.sku}
                        </td>

                        <td className="p-4">
                          <div className="font-medium">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="mt-1 text-xs text-slate-500">
                              {product.description}
                            </div>
                          )}
                        </td>

                        <td className="whitespace-nowrap p-4">
                          RM{Number(product.price).toFixed(2)}
                        </td>

                        <td className="p-4">
                          {product.stock_quantity}
                        </td>

                        <td className="p-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              lowStock
                                ? "bg-red-50 text-red-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {lowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(product)
                                  }
                                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-blue-700 hover:bg-blue-50"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteProduct(product)
                                  }
                                  disabled={
                                    deletingProductId !== null
                                  }
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-red-700 hover:bg-red-50 disabled:opacity-60"
                                >
                                  {deletingProductId === product.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setStockProduct(product);
                                setStockMovementType("stock_in");
                                setStockQuantity("1");
                                setStockNotes("");
                                setStockError("");
                              }}
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-green-700 hover:bg-green-50"
                            >
                              Adjust Stock
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-slate-500"
                      >
                        No products found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <footer className="mt-8 text-center text-xs text-slate-400">
            StockWise · Product Management
          </footer>
        </section>
      </main>
    </AuthGuard>
  );
}
