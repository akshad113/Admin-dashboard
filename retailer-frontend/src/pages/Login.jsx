import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { hasRetailerAccess, setRetailerSession } from "../lib/auth";
import { apiRequest } from "../lib/api";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const logoutMessage = location.state?.message;

  const [formState, setFormState] = useState({
    email: "",
    password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (hasRetailerAccess()) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const payload = await apiRequest("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: formState.email.trim(),
          password: formState.password
        })
      });

      const roles = Array.isArray(payload?.user?.roles) ? payload.user.roles : [];
      const hasRetailerRole = roles.some((role) => {
        const normalized = String(role).toLowerCase();
        return normalized === "manager" || normalized === "admin";
      });

      if (!hasRetailerRole) {
        setError("This account does not have retailer access.");
        return;
      }

      setRetailerSession({
        token: payload.token,
        user: payload.user
      });

      navigate(location.state?.from || "/", { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Retailer Access</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Sign In</h1>
          <p className="mt-2 text-sm text-slate-500">Manage products, track orders, and monitor your seller performance.</p>
          {logoutMessage ? <p className="mt-2 text-sm font-medium text-emerald-600">{logoutMessage}</p> : null}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              name="email"
              type="email"
              placeholder="retailer@store.com"
              value={formState.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formState.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Signing In..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
