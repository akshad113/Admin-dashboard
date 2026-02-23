import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import Button from "../components/ui/Button";
import { apiRequest } from "../lib/api";

const loginSchema = yup.object({
  email: yup.string().trim().email("Please enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  portal: yup.string().oneOf(["admin", "retailer"]).required("Please select account type"),
});

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState("retailer");
  const [loading, setLoading] = useState(false);
  const adminAppUrl = import.meta.env.VITE_ADMIN_APP_URL || "http://localhost:5173";

  const redirectToTargetApp = (targetUrl, authPayload) => {
    const redirectUrl = new URL("/login", targetUrl);
    redirectUrl.searchParams.set("token", authPayload.token);
    redirectUrl.searchParams.set("portal", authPayload.portal);
    redirectUrl.searchParams.set("user", JSON.stringify(authPayload.user || {}));
    window.location.href = redirectUrl.toString();
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const transferToken = params.get("token");
    const transferPortal = String(params.get("portal") || "").toLowerCase();
    const transferUser = params.get("user");

    if (transferToken && transferPortal === "retailer") {
      let parsedUser = {};
      try {
        parsedUser = transferUser ? JSON.parse(transferUser) : {};
      } catch (error) {
        parsedUser = {};
      }
      localStorage.setItem("token", transferToken);
      localStorage.setItem("user", JSON.stringify(parsedUser));
      localStorage.setItem("portal", "retailer");
      navigate("/", { replace: true });
      return;
    }

    const token = localStorage.getItem("token");
    const storedPortal = localStorage.getItem("portal");
    if (token && storedPortal === "retailer") {
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      await loginSchema.validate({ email, password, portal }, { abortEarly: false });
    } catch (validationError) {
      const firstMessage = validationError?.errors?.[0] || "Please enter valid login details";
      toast.error(firstMessage);
      return;
    }

    setLoading(true);
    try {
      const data = await apiRequest("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, portal }),
      });

      if (portal === "retailer") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        localStorage.setItem("portal", "retailer");
        toast.success("Login successful");
        navigate("/", { replace: true });
      } else {
        toast.success("Admin login successful. Redirecting...");
        redirectToTargetApp(adminAppUrl, {
          token: data.token,
          portal: "admin",
          user: data.user || {},
        });
      }
    } catch (error) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Account Access</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Sign In</h1>
          <p className="mt-2 text-sm text-slate-500">Use one sign-in form for Admin and Retailer accounts.</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Account Type</label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
              value={portal}
              onChange={(e) => setPortal(e.target.value)}
            >
              <option value="admin">Admin</option>
              <option value="retailer">Retailer</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              placeholder="retailer@store.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
