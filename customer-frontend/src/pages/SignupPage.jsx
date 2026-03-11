import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore.js";

export default function SignupPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);
  const signupCustomer = useAuthStore((state) => state.signupCustomer);

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
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
        password: formState.password
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Signup failed");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form
        className="w-full max-w-md space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            Get started
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-sm text-slate-500">
            Join as a customer to save your cart and track orders.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="name" className="text-xs font-semibold text-slate-600">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            value={formState.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold text-slate-600">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formState.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-xs font-semibold text-slate-600">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            value={formState.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-600">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            autoComplete="new-password"
            value={formState.confirmPassword}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </div>

        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-900">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
