# StockWise — Inventory Management System

StockWise is a web-based inventory management system designed to help small businesses manage products, monitor stock movements, process sales transactions, and review inventory and sales reports.

## Live Demo

**Production URL:** https://stockwise-chi-nine.vercel.app

StockWise is deployed using Vercel and connected to Supabase.

## Features

- **Authentication:** Secure sign-in and protected application pages.
- **Role-Based Access Control:** Supports Admin and Staff roles with different permissions.
- **Product Management:** View, add, edit, delete, and manage products according to user permissions.
- **Stock Movements:** Track stock-in activities, sales deductions, and stock adjustments.
- **Sales Management:** Create sales transactions and automatically update inventory quantities.
- **Reports:** Review sales performance, completed orders, top-selling products, and inventory value.
- **Date Filters and CSV Export:** Filter report data and export supported report information.
- **Database Security:** Uses Supabase Row Level Security (RLS) and database-side validation for supported operations.

## Technology Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Supabase
- PostgreSQL
- Git and GitHub
- Vercel

## Prerequisites

Install the following before running StockWise locally:

- Node.js and npm
- A Supabase project
- Git (optional, for version control)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/fongguo57-del/stockwise.git
cd stockwise
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root directory and add your Supabase project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with the corresponding values from your Supabase project.

**Security:** Never commit `.env.local` to version control. Do not expose Supabase secret keys or service-role keys in client-side code.

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

To verify the production build:

```bash
npm run build
```

To start the production server after a successful build:

```bash
npm run start
```

## User Roles and Permissions

### Admin

The Admin role has access to administrative product management functions and the relevant inventory, sales, and reporting features.

Admin permissions include:

- View products.
- Add new products.
- Edit existing products.
- Delete products.
- Adjust stock quantities.
- Process sales.
- Access reports.

### Staff

The Staff role is designed for daily operational activities.

Staff permissions include:

- View products.
- Adjust stock quantities.
- Process sales.
- Access permitted application features.

Administrative product management actions, such as adding, editing, and deleting products, are restricted to Admin users.

## Main Application Sections

- **Dashboard:** Provides an overview of inventory and business information.
- **Products:** Displays the product catalogue and administrative product management functions.
- **Inventory:** Displays stock movement history and inventory adjustments.
- **Sales:** Handles sales transactions and inventory deductions.
- **Reports:** Provides sales and inventory summaries, date filters, and CSV export.

## Database and Security

StockWise uses Supabase and PostgreSQL to store application data.

The database includes the following main tables:

- `profiles`
- `categories`
- `products`
- `sales`
- `sale_items`
- `stock_movements`

Row Level Security (RLS), role validation, and database-side functions are used to protect supported operations and maintain inventory consistency.

The application also includes validation for stock adjustments and sales transactions to help prevent invalid inventory operations.

Private credentials and environment variables are excluded from source control.

## Testing

The following functional areas were tested during development:

- Authentication and protected routes.
- Admin and Staff permissions.
- Product management.
- Stock adjustments and stock movement records.
- Sales processing and inventory deductions.
- Insufficient-stock validation.
- Reports and date filters.
- CSV export.
- Error handling and data consistency.
- Production deployment and live application functionality.

## AI Tool Usage

AI tools, including ChatGPT, were used as development assistance throughout this project.

AI assistance included:

- Understanding Next.js, TypeScript, and Supabase concepts.
- Troubleshooting programming errors and debugging issues.
- Reviewing database operations and application logic.
- Improving application documentation and README content.

AI-generated suggestions were reviewed, adapted, and tested during development. The developer is responsible for understanding the implemented functionality and explaining the system design and technical decisions.

## Project Purpose

StockWise demonstrates the development of a web-based inventory and sales management application using modern web technologies.

The project focuses on implementing authentication, role-based access control, product management, inventory tracking, sales processing, database security, and reporting features to support small-business operations.