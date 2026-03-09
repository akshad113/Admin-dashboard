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
    <main className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>
        <p>Join as a customer to save your cart and track orders.</p>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          value={formState.name}
          onChange={handleChange}
        />

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
          minLength={6}
          required
          autoComplete="new-password"
          value={formState.password}
          onChange={handleChange}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          minLength={6}
          required
          autoComplete="new-password"
          value={formState.confirmPassword}
          onChange={handleChange}
        />

        {error ? <p className="auth-error">{error}</p> : null}

        <button type="submit" disabled={authLoading}>
          {authLoading ? "Creating..." : "Sign Up"}
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}
