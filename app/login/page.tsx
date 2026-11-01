"use client";

import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) 
    {
        event.preventDefault();
        setErrorMessage("");
        setLoading(true);

            try {
                const { error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

                if (error) {
                    setErrorMessage(error.message);
                    return;
                }

                router.push("/dashboard");
            } catch {
                setErrorMessage("Unable to sign in. Please try again.");
            } finally {
                setLoading(false);
            }
   }
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
            <form
                onSubmit={handleLogin}
                className="w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-lg">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">StockWise</h1>
                        <p className="mt-2 text-slate-500">
                            Sign in to your inventory dashboard
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
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

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
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
                            placeholder="••••••••"
                        />
                    </div>

                    {errorMessage && (
                       <p role="alert" className="text-red-600">
                            {errorMessage}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
        </main>
    );
}