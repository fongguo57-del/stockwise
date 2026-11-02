
import Link from "next/link";
import StockWiseLogo from "@/components/StockWiseLogo";

const features = [
  {
    title: "Product Management",
    description:
      "Manage computer products and accessories, including product details, categories, pricing and stock information.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className="h-7 w-7" aria-hidden="true">
        <path d="m12 3 9 5-9 5-9-5 9-5Z" />
        <path d="m3 8 9 5 9-5" />
        <path d="M3 8v9l9 5 9-5V8" />
        <path d="M12 13v9" />
      </svg>
    ),
  },
  {
    title: "Inventory Tracking",
    description:
      "Monitor available stock, record incoming products and stock movements, and identify items that need restocking.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className="h-7 w-7" aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <rect x="7" y="11" width="3" height="5" rx="0.5" />
        <rect x="13" y="7" width="3" height="9" rx="0.5" />
        <rect x="19" y="3" width="2" height="13" rx="0.5" />
      </svg>
    ),
  },
  {
    title: "Sales Management",
    description:
      "Record customer purchases, process sales transactions and maintain a history of products sold by the store.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className="h-7 w-7" aria-hidden="true">
        <path d="M3 3h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.4L22 8H6" />
        <circle cx="10" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M12 6h5" />
        <path d="M14.5 3.5v5" />
      </svg>
    ),
  },
  {
    title: "Business Reports",
    description:
      "Review store revenue, sales performance and inventory information to support everyday business decisions.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
        className="h-7 w-7" aria-hidden="true">
        <path d="M4 19V5" />
        <path d="M4 19h17" />
        <path d="m7 15 4-4 3 2 6-7" />
        <path d="M16 6h4v4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      {/* Navigation */}
      <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5 md:px-16">
        <Link href="/" aria-label="StockWise Home">
          <StockWiseLogo iconSize={44} />
        </Link>

        <div className="flex items-center gap-6">
          <a
            href="#features"
            className="hidden text-sm font-semibold text-slate-700 transition hover:text-blue-800 sm:block"
          >
            System Features
          </a>

          <Link
            href="/login"
            style={{ backgroundColor: "#1e3a8a", color: "#ffffff" }}
            className="rounded-lg px-5 py-2.5 text-sm font-bold transition hover:!bg-blue-950"
          >
            Employee Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="overflow-hidden bg-slate-100 px-6 py-20 md:px-16 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-bold text-blue-800 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-700" />
              Computer Store Management System
            </div>

            <h2 className="mt-7 max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-6xl">
              Manage Your
              <span className="block text-blue-800">
                Computer Store Smarter.
              </span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-700 md:text-lg">
              StockWise helps our store manage computer products and
              accessories, monitor inventory, record daily sales and
              review business performance in one convenient system.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/login"
                style={{ backgroundColor: "#1e3a8a", color: "#ffffff" }}
                className="inline-flex items-center rounded-xl px-7 py-3.5 text-sm font-bold shadow-lg transition hover:-translate-y-0.5 hover:!bg-blue-950"
              >
                Employee Login <span className="ml-2">→</span>
              </Link>

              <a
                href="#features"
                className="rounded-xl border-2 border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 transition hover:border-blue-700 hover:bg-blue-50 hover:text-blue-900"
              >
                Explore System
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700">
              <span>✓ Product Management</span>
              <span>✓ Stock Tracking</span>
              <span>✓ Sales Records</span>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-300/60 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-indigo-300/60 blur-3xl" />

            <div className="relative rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl shadow-slate-400/40 md:p-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <p className="text-sm font-extrabold text-slate-950">
                    Computer Store Overview
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Illustrative dashboard preview
                  </p>
                </div>

                <div className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-900">
                  DEMO
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-600">
                    Total Products
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">
                    128
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Illustrative value
                  </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-900">
                    Sales Revenue
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-slate-950">
                    RM 8.4k
                  </p>
                  <p className="mt-1 text-xs font-medium text-blue-800">
                    Illustrative value
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    Store Activity
                  </p>
                  <span className="text-xs font-semibold text-slate-500">
                    Demo data
                  </span>
                </div>

                <div className="mt-6 flex h-32 items-end gap-3">
                  {[45, 70, 55, 90, 65, 100, 75].map((height, index) => (
                    <div key={index} className="flex flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-blue-700"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-between text-xs font-semibold text-slate-600">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Daily Store Operations
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-600">
                    Products, inventory and sales in one place
                  </p>
                </div>

                <span className="text-2xl font-bold text-blue-800">↗</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white px-6 py-20 md:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
              Store Operations
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
              Tools for Managing Our Computer Store
            </h2>

            <p className="mt-4 text-base text-slate-700">
              Supporting our daily product, inventory and sales operations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-300 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-400 hover:shadow-lg"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-800 shadow-sm">
                  {feature.icon}
                </div>

                <h3 className="text-lg font-bold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-950 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
            StockWise Store System
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Ready for Your Daily Store Operations?
          </h2>

          <p className="mx-auto mt-5 max-w-xl leading-7 text-blue-100">
            Access product management, inventory tracking, sales
            records and business reports through one central system.
          </p>

          <Link
            href="/login"
            style={{ backgroundColor: "#ffffff", color: "#1e3a8a" }}
            className="mt-8 inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-4 text-base font-extrabold shadow-xl transition hover:-translate-y-1 hover:!bg-blue-100"
          >
            Employee Login →
          </Link>

          <p className="mt-4 text-xs text-blue-200">
            For authorised store employees
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-8 md:px-16">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <StockWiseLogo light iconSize={48} textSize="text-2xl" />
            <p className="mt-2 text-xs font-medium text-slate-300">
              Computer Store Inventory & Sales Management System
            </p>
          </div>

          <p className="text-center text-xs text-slate-300">
            © 2026 StockWise. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
