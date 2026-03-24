"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../../store/useAuthStore";

// Render the customer login page.
export default function LoginPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);
  const loginCustomer = useAuthStore((state) => state.loginCustomer);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace("/");
    }
  }, [router, user]);

  // Update a single form field when the user types.
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the login form and send the user to the home page.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    try {
      await loginCustomer({
        email: formState.email.trim(),
        password: formState.password,
      });
      router.push("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    }
  };

  // Sign in with Google and send the user to the home page.
  const handleGoogleLogin = async () => {
    setError("");

    try {
      await loginWithGoogle();
      router.push("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Google login failed");
    }
  };

  if (user) {
    return null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
      <form
        className="w-full max-w-md space-y-5 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Welcome back</p>
          <h1 className="font-display text-3xl font-black text-slate-900">Customer Login</h1>
          <p className="text-sm leading-6 text-slate-500">
            Sign in to save your cart and track your orders.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Email</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formState.email}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Password</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={formState.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </label>

        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-full bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Signing in..." : "Login"}
        </button>

        <div className="relative py-2">
          <div className="h-px w-full bg-slate-200" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
            or
          </span>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={authLoading}
          className="w-full rounded-full border border-slate-200 bg-white py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <p className="text-sm text-slate-500">
          New customer?{" "}
          <Link href="/register" className="font-semibold text-slate-900">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}
