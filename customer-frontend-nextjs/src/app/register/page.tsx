"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthStore } from "../../store/useAuthStore";

// Render the customer registration page.
export default function RegisterPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);
  const signupCustomer = useAuthStore((state) => state.signupCustomer);
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

  // Submit the signup form and send the user to the home page.
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await signupCustomer({
        name: formState.name.trim(),
        email: formState.email.trim(),
        password: formState.password,
      });
      router.push("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Signup failed");
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
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Get started</p>
          <h1 className="font-display text-3xl font-black text-slate-900">Create Account</h1>
          <p className="text-sm leading-6 text-slate-500">
            Join as a customer to save your cart and track orders.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Name</span>
          <input
            name="name"
            type="text"
            required
            autoComplete="name"
            value={formState.name}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </label>

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
            minLength={6}
            required
            autoComplete="new-password"
            value={formState.password}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">Confirm password</span>
          <input
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            value={formState.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </label>

        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-full bg-amber-400 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
