import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { apiRequest } from "../lib/api";

const LogIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        {location.state?.message ? (
          <p className="mb-4 text-sm text-green-700">{location.state.message}</p>
        ) : null}

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

        {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

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
