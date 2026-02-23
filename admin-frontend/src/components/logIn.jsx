import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as yup from "yup";
import { apiRequest } from "../lib/api";

const loginSchema = yup.object({
  email: yup.string().trim().email("Please enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  portal: yup.string().oneOf(["admin", "retailer"]).required("Please select account type"),
});

const LogIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portal, setPortal] = useState("admin");
  const [loading, setLoading] = useState(false);
  const retailerAppUrl = import.meta.env.VITE_RETAILER_APP_URL || "http://localhost:5174";

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

    if (transferToken && transferPortal === "admin") {
      let parsedUser = {};
      try {
        parsedUser = transferUser ? JSON.parse(transferUser) : {};
      } catch (error) {
        parsedUser = {};
      }
      localStorage.setItem("token", transferToken);
      localStorage.setItem("user", JSON.stringify(parsedUser));
      localStorage.setItem("portal", "admin");
      navigate("/", { replace: true });
      return;
    }

    const token = localStorage.getItem("token");
    const storedPortal = localStorage.getItem("portal");
    if (token && storedPortal === "admin") {
      navigate("/", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      await loginSchema.validate(
        { email, password, portal },
        { abortEarly: false }
      );
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

      if (portal === "admin") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user || {}));
        localStorage.setItem("portal", "admin");
        toast.success("Login successful");
        navigate("/", { replace: true });
      } else {
        toast.success("Retailer login successful. Redirecting...");
        redirectToTargetApp(retailerAppUrl, {
          token: data.token,
          portal: "retailer",
          user: data.user || {},
        });
      }
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

        <select
          className="w-full mb-4 p-2 border rounded"
          value={portal}
          onChange={(e) => setPortal(e.target.value)}
        >
          <option value="admin">Admin</option>
          <option value="retailer">Retailer</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-sm text-center mt-4">
          Need a test account?{" "}
        </p>
      </form>
    </div>
  );
};

export default LogIn;
