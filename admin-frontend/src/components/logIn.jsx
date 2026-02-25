import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiRequest } from "../lib/api";
import { loginValidationSchema } from "../validation/schemas";

const LogIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);

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
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-200">
      <form
        onSubmit={formik.handleSubmit}
        noValidate
        className="bg-white p-8 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        <input
          name="email"
          type="text"
          inputMode="email"
          placeholder="Email"
          className={`w-full p-2 border rounded ${
            formik.touched.email && formik.errors.email ? "border-red-400" : "mb-4"
          }`}
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          autoComplete="email"
        />
        {formik.touched.email && formik.errors.email ? (
          <p className="mb-4 text-xs text-red-600">{formik.errors.email}</p>
        ) : (
          <div className="mb-4" />
        )}

        <input
          name="password"
          type="password"
          placeholder="Password"
          className={`w-full p-2 border rounded ${
            formik.touched.password && formik.errors.password ? "border-red-400" : "mb-4"
          }`}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          autoComplete="current-password"
        />
        {formik.touched.password && formik.errors.password ? (
          <p className="mb-4 text-xs text-red-600">{formik.errors.password}</p>
        ) : (
          <div className="mb-4" />
        )}

        <button
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-60"
          disabled={loading || formik.isSubmitting}
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
