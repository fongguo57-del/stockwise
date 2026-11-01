
# StockWise — Inventory Management System

StockWise is a web-based inventory management system built to help businesses manage products, monitor stock movements, process sales, and review inventory and sales reports.

## Features

- **Authentication:** Sign in and access protected pages.
- **Role-based access:** Supports Admin and Staff roles with different permissions.
- **Product management:** View, add, edit, delete, and manage products according to role permissions.
- **Stock movements:** Track stock-in activities, sales deductions, and stock adjustments.
- **Sales management:** Create sales transactions and update inventory quantities.
- **Reports:** Review sales performance, completed orders, top-selling products, and inventory value.
- **Date filters and CSV export:** Filter report data and export supported report information.
- **Database security:** Uses Supabase with Row Level Security (RLS) and database-side validation for supported operations.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Git

## Prerequisites

Install the following before running StockWise locally:

- Node.js and npm
- A Supabase project
- Git (optional, for version control)

## Getting Started

### 1. Install dependencies

Clone or open the StockWise project directory, then run:

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root and add your own Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with the corresponding values from your Supabase project.

**Security:** Never commit `.env.local` to version control. Do not put Supabase secret keys or service-role keys in client-side code.

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for production

To verify the production build:

```bash
npm run build
```

To start the production server after a successful build:

```bash
npm run start
```

## User Roles

### Admin

The Admin role has access to administrative product management functions and the relevant inventory, sales, and reporting features.

### Staff

The Staff role can perform permitted operational tasks, such as stock adjustments and sales, while restricted administrative actions remain unavailable.

Access is enforced through the application's authorization logic and database permissions.

## Main Application Sections

- **Dashboard:** Inventory and business overview.
- **Products:** Product catalogue and product management.
- **Inventory:** Stock movement history.
- **Sales:** Sales transactions and stock deductions.
- **Reports:** Sales and inventory summaries.

## Database and Security

StockWise uses Supabase and PostgreSQL to store application data.

The database includes tables for profiles, categories, products, sales, sale items, and stock movements.

Row Level Security (RLS), role validation, and database-side functions are used to protect supported operations and maintain inventory consistency.

Keep all private credentials out of source control. Review database policies and function permissions before deploying to a production environment.

## Testing

The following functional areas have been tested during development:

- Authentication and protected routes
- Admin and Staff permissions
- Product management
- Stock adjustments and stock movement records
- Sales processing and inventory deductions
- Insufficient-stock validation
- Reports, date filters, and CSV export
- Error handling and data consistency

Testing results should be confirmed against the final submitted version.

## Project Purpose

StockWise demonstrates the development of an inventory management application using a modern web technology stack, with role-based access control, sales processing, stock tracking, and reporting.

