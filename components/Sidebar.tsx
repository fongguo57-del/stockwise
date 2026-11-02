
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import StockWiseLogo from "@/components/StockWiseLogo";

const navItems = [
  { icon: "▦", label: "Dashboard", href: "/dashboard" },
  { icon: "□", label: "Products", href: "/products" },
  { icon: "⇄", label: "Inventory", href: "/stock-movements" },
  { icon: "▤", label: "Sales", href: "/sales" },
  { icon: "▥", label: "Reports", href: "/reports" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      window.alert("Logout failed. Please try again.");
      return;
    }

    router.replace("/login");
  }

  return (
    <aside className="flex w-full shrink-0 flex-col bg-slate-950 p-5 text-white md:sticky md:top-0 md:h-screen md:w-64">
      <Link href="/dashboard" className="mb-8 flex items-center gap-3">
        <StockWiseLogo light={true} iconSize={32} textSize="text-lg" /> 
        <p className="text-xs text-slate-400">
            Inventory Management
          </p>
      </Link>

      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Workspace
      </p>

      <nav
        aria-label="Main navigation"
        className="flex gap-2 overflow-x-auto md:flex-col"
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span
                aria-hidden="true"
                className="w-5 text-center text-lg"
              >
                {item.icon}
              </span>

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-sm font-semibold">StockWise</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          Manage products, inventory movements, sales and reports
          in one place.
        </p>
      </div>

      <div className="mt-6 border-t border-slate-800 pt-5 md:mt-auto">
        <p className="text-xs text-slate-500">
          Inventory &amp; Sales Management
        </p>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <span aria-hidden="true">⇦</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
