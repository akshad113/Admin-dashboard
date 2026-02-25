import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { apiRequest } from "../lib/api";
import { updateUserValidationSchema } from "../validation/schemas";

function EditUserModal({ user, onClose, onSaved }) {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState("");

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      roleId: user?.role_id ? String(user.role_id) : "",
      status: String(user?.status || "active").toLowerCase(),
    },
    validationSchema: updateUserValidationSchema,
    onSubmit: async (values) => {
      setError("");

      try {
        await apiRequest(`/users/${user.user_id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            role_id: Number(values.roleId),
            status: String(values.status).toLowerCase(),
          }),
        });

        await onSaved?.();
        onClose();
      } catch (err) {
        setError(err.message || "Failed to update user");
      }
    },
  });

  useEffect(() => {
    let mounted = true;
    apiRequest("/roles")
      .then((data) => mounted && setRoles(Array.isArray(data) ? data : []))
      .catch((err) => mounted && setError(err.message || "Failed to load roles"))
      .finally(() => mounted && setLoadingRoles(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto mt-20 w-[95%] max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit User</h3>

        <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <input
            name="name"
            className={`w-full rounded-lg px-3 py-2 ${
              formik.touched.name && formik.errors.name
                ? "border border-red-400"
                : "border border-slate-300"
            }`}
            value={formik.values.name}
            onChange={(e) => {
              formik.handleChange(e);
              setError("");
            }}
            onBlur={formik.handleBlur}
            placeholder="Name"
          />
          {formik.touched.name && formik.errors.name ? (
            <p className="text-xs text-red-600">{formik.errors.name}</p>
          ) : null}

          <input
            name="email"
            type="text"
            inputMode="email"
            className={`w-full rounded-lg px-3 py-2 ${
              formik.touched.email && formik.errors.email
                ? "border border-red-400"
                : "border border-slate-300"
            }`}
            value={formik.values.email}
            onChange={(e) => {
              formik.handleChange(e);
              setError("");
            }}
            onBlur={formik.handleBlur}
            placeholder="Email"
          />
          {formik.touched.email && formik.errors.email ? (
            <p className="text-xs text-red-600">{formik.errors.email}</p>
          ) : null}

          <select
            name="roleId"
            className={`w-full rounded-lg px-3 py-2 ${
              formik.touched.roleId && formik.errors.roleId
                ? "border border-red-400"
                : "border border-slate-300"
            }`}
            value={formik.values.roleId}
            onChange={(e) => {
              formik.handleChange(e);
              setError("");
            }}
            onBlur={formik.handleBlur}
            disabled={loadingRoles}
          >
            <option value="">{loadingRoles ? "Loading roles..." : "Select role"}</option>
            {roles.map((r) => (
              <option key={r.role_id} value={r.role_id}>
                {r.role_name}
              </option>
            ))}
          </select>
          {formik.touched.roleId && formik.errors.roleId ? (
            <p className="text-xs text-red-600">{formik.errors.roleId}</p>
          ) : null}

          <select
            name="status"
            className={`w-full rounded-lg px-3 py-2 ${
              formik.touched.status && formik.errors.status
                ? "border border-red-400"
                : "border border-slate-300"
            }`}
            value={formik.values.status}
            onChange={(e) => {
              formik.handleChange(e);
              setError("");
            }}
            onBlur={formik.handleBlur}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {formik.touched.status && formik.errors.status ? (
            <p className="text-xs text-red-600">{formik.errors.status}</p>
          ) : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={formik.isSubmitting || loadingRoles}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {formik.isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
