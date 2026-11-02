
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type UserRole = "admin" | "staff";

export default function LoginPage() {
    const router = useRouter();

    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!selectedRole) {
            setErrorMessage("Please select your account type.");
            return;
        }

        setErrorMessage("");
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                setErrorMessage(error.message);
                return;
            }

            if (!data.user) {
                setErrorMessage("Unable to identify your account.");
                await supabase.auth.signOut();
                return;
            }

            // Verify the actual role stored in the database
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();

            if (profileError || !profile) {
                await supabase.auth.signOut();
                setErrorMessage("Unable to verify your account permissions.");
                return;
            }

            // Ensure the selected account type matches the database role
            if (profile.role !== selectedRole) {
                await supabase.auth.signOut();
                setErrorMessage(
                    `This account does not have ${selectedRole === "admin" ? "Admin" : "Employee"} access. Please select the correct account type.`
                );
                return;
            }

            router.push("/dashboard");
        } catch {
            await supabase.auth.signOut();
            setErrorMessage("Unable to sign in. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-900">
                        StockWise
                    </h1>
                    <p className="mt-2 text-slate-500">
                        Computer Store Management System
                    </p>
                </div>

                <div>
                    <h2 className="text-center text-xl font-bold text-slate-900">
                        Welcome Back
                    </h2>
                    <p className="mt-1 text-center text-sm text-slate-500">
                        Select your account type to continue.
                    </p>
                </div>

                {/* Account Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRole("admin");
                            setErrorMessage("");
                        }}
                        className={`rounded-xl border-2 p-4 text-left transition ${
                            selectedRole === "admin"
                                ? "border-blue-700 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300"
                        }`}
                    >
                        <div className="text-2xl">🛡️</div>
                        <p className="mt-2 font-bold text-slate-900">
                            Admin Login
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Store owner
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setSelectedRole("staff");
                            setErrorMessage("");
                        }}
                        className={`rounded-xl border-2 p-4 text-left transition ${
                            selectedRole === "staff"
                                ? "border-blue-700 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300"
                        }`}
                    >
                        <div className="text-2xl">👤</div>
                        <p className="mt-2 font-bold text-slate-900">
                            Employee Login
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            Store employees
                        </p>
                    </button>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Password */}
                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-slate-700"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                        placeholder="Enter your password"
                    />
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <p
                        role="alert"
                        className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
                    >
                        {errorMessage}
                    </p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || !selectedRole}
                    className="w-full rounded-lg bg-blue-900 px-4 py-3 font-semibold text-white transition hover:bg-blue-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Signing in..."
                        : selectedRole === "admin"
                        ? "Sign In as Admin"
                        : selectedRole === "staff"
                        ? "Sign In as Employee"
                        : "Select Account Type"}
                </button>

                <div className="text-center">
                    <Link
                        href="/"
                        className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </form>
        </main>
    );
}
