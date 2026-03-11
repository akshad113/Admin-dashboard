import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuthStore } from "../store/useAuthStore.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const authLoading = useAuthStore((state) => state.authLoading);
  const loginCustomer = useAuthStore((state) => state.loginCustomer);

  const [formState, setFormState] = useState({
    email: "",
    password: ""
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

    try {
      await loginCustomer({
        email: formState.email.trim(),
        password: formState.password
      });
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Login failed");
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
            Welcome back
          </p>
          <h1 className="text-2xl font-bold text-slate-900">Customer Login</h1>
          <p className="text-sm text-slate-500">
            Sign in to access saved details and checkout faster.
          </p>
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
            required
            autoComplete="current-password"
            value={formState.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
          />
        </div>

        {error ? <p className="text-sm font-semibold text-rose-600">{error}</p> : null}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full rounded-full bg-amber-400 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {authLoading ? "Signing in..." : "Login"}
        </button>

        <p className="text-sm text-slate-500">
          New customer?{" "}
          <Link to="/signup" className="font-semibold text-slate-900">
            Create account
          </Link>
        </p>
      </form>
    </main>
  );
}
