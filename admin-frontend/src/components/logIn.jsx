import { useEffect } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { apiRequest } from "../lib/api";
import { loginValidationSchema } from "../validation/schemas";

// Render the admin login form.
const LogIn = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state?.message]);

  // Submit the admin login form and store the session token.
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const data = await apiRequest("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email.trim(),
          password: values.password,
        }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: handleSubmit,
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60"
      >
        <div className="mb-8 space-y-2 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600">Admin Access</p>
          <h2 className="text-3xl font-black text-slate-900">Sign In</h2>
          <p className="text-sm text-slate-500">Use your admin email and password to manage the dashboard.</p>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          placeholder="Email"
          className={`mb-2 w-full rounded-xl border px-4 py-3 text-sm outline-none ring-cyan-300 focus:ring-2 ${
            formik.touched.email && formik.errors.email ? "border-rose-400" : "border-slate-200"
          }`}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          autoComplete="email"
        />
        {formik.touched.email && formik.errors.email ? (
          <p className="mb-4 text-xs font-semibold text-rose-600">{formik.errors.email}</p>
        ) : (
          <div className="mb-4" />
        )}

        <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          className={`mb-2 w-full rounded-xl border px-4 py-3 text-sm outline-none ring-cyan-300 focus:ring-2 ${
            formik.touched.password && formik.errors.password ? "border-rose-400" : "border-slate-200"
          }`}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          autoComplete="current-password"
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="mb-4 text-xs font-semibold text-rose-600">{formik.errors.password}</p>
        ) : (
          <div className="mb-4" />
        )}

        <button
          type="submit"
          className="w-full rounded-full bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={formik.isSubmitting}
        >
          {formik.isSubmitting ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
};

export default LogIn;
