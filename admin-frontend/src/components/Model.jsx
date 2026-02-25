import { useEffect, useState } from "react";
import { useFormik } from "formik";
import { apiRequest } from "../lib/api";
import { createUserValidationSchema } from "../validation/schemas";

function Model({ onClose, onUserCreated }) {
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      roleId: "",
    },
    validationSchema: createUserValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setError("");

      try {
        await apiRequest("/createuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: values.name.trim(),
            email: values.email.trim().toLowerCase(),
            role_id: Number(values.roleId),
          }),
        });
      } catch (err) {
        console.error(err, "Error adding user to database");
        setError(err.message || "Failed to create user");
        return;
      }

      if (onUserCreated) {
        await onUserCreated();
      }

      resetForm();
      onClose();
    },
  });

  useEffect(() => {
    let isMounted = true;

    apiRequest("/roles")
      .then((data) => {
        if (!isMounted) return;
        setRoles(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load roles", err);
        if (!isMounted) return;
        setRoles([]);
        setError(err.message || "Failed to load roles");
      })
      .finally(() => {
        if (isMounted) setLoadingRoles(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed z-[100] inset-0 overflow-y-auto">
      <div
        className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          {" "}
        </span>

        <div
          className="fixed z-[101] inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Add New User
          </h3>

          <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                type="text"
                value={formik.values.name}
                onChange={(e) => {
                  formik.handleChange(e);
                  setError("");
                }}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formik.touched.name && formik.errors.name
                    ? "border border-red-400"
                    : "border border-gray-300"
                }`}
              />
              {formik.touched.name && formik.errors.name ? (
                <p className="mt-1 text-xs text-red-600">{formik.errors.name}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="text"
                inputMode="email"
                value={formik.values.email}
                onChange={(e) => {
                  formik.handleChange(e);
                  setError("");
                }}
                onBlur={formik.handleBlur}
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formik.touched.email && formik.errors.email
                    ? "border border-red-400"
                    : "border border-gray-300"
                }`}
              />
              {formik.touched.email && formik.errors.email ? (
                <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
              ) : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                name="roleId"
                value={formik.values.roleId}
                onChange={(e) => {
                  formik.handleChange(e);
                  setError("");
                }}
                onBlur={formik.handleBlur}
                disabled={loadingRoles}
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  formik.touched.roleId && formik.errors.roleId
                    ? "border border-red-400"
                    : "border border-gray-300"
                }`}
              >
                <option value="">
                  {loadingRoles ? "Loading roles..." : "Select Role"}
                </option>
                {roles.map((r) => (
                  <option key={r.role_id} value={r.role_id}>
                    {r.role_name}
                  </option>
                ))}
              </select>
              {formik.touched.roleId && formik.errors.roleId ? (
                <p className="mt-1 text-xs text-red-600">{formik.errors.roleId}</p>
              ) : null}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                disabled={loadingRoles || formik.isSubmitting}
              >
                {formik.isSubmitting ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div> 
      </div>
    </div>
  );
}

export default Model;
 
