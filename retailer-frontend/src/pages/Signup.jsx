import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import { apiRequest } from "../lib/api";
import { hasRetailerAccess } from "../lib/auth";

// Render the retailer signup request page.
function Signup() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (hasRetailerAccess()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Update a single form field as the user types.
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  // Submit the retailer request and return the user to login with a status message.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (formState.password !== formState.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);

    try {
      const payload = await apiRequest("/retailer/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim(),
          password: formState.password,
        }),
      });

      navigate("/login", {
        replace: true,
        state: {
          message: payload?.message || "Request submitted. Wait for admin approval.",
        },
      });
    } catch (requestError) {
      setError(requestError.message || "Signup request failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (hasRetailerAccess()) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
            Retailer Access
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">Request Signup</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create your retailer request and wait for admin approval.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
            <input
              name="name"
              type="text"
              required
              placeholder="Store owner name"
              value={formState.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="retailer@store.com"
              value={formState.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              minLength={6}
              required
              placeholder="Create a password"
              value={formState.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              minLength={6}
              required
              placeholder="Repeat your password"
              value={formState.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none ring-blue-300 placeholder:text-slate-400 focus:ring-2"
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Request Approval"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have access?{" "}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
