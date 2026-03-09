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
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Customer Login</h1>
        <p>Sign in to access saved details and checkout faster.</p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={formState.email}
          onChange={handleChange}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={formState.password}
          onChange={handleChange}
        />

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" disabled={authLoading}>
          {authLoading ? "Signing in..." : "Login"}
        </button>

        <p className="auth-switch">
          New customer? <Link to="/signup">Create account</Link>
        </p>
      </form>
    </main>
  );
}
