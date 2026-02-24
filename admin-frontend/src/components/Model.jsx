import React, { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const validateCreateUser = ({ name, email, roleId }) => {
  const errors = {};
  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const parsedRoleId = Number(roleId);

  if (!normalizedName) {
    errors.name = "Name is required";
  } else if (normalizedName.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (normalizedName.length > 100) {
    errors.name = "Name must be at most 100 characters";
  }

  if (!normalizedEmail) {
    errors.email = "Email is required";
  } else if (!emailRegex.test(normalizedEmail)) {
    errors.email = "Please enter a valid email";
  }

  if (!roleId) {
    errors.roleId = "Role is required";
  } else if (!Number.isInteger(parsedRoleId) || parsedRoleId <= 0) {
    errors.roleId = "Please select a valid role";
  }

  return errors;
};

function Model({ onClose, onUserCreated }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validationErrors = validateCreateUser({ name, email, roleId });
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest("/createuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role_id: Number(roleId),
        }),
      });
    } catch (error) {
      console.error(error, "Error adding user to database");
      setError(error.message || "Failed to create user");
      setSubmitting(false);
      return;
    }

    if (onUserCreated) {
      await onUserCreated();
    }

    setSubmitting(false);
    onClose();
  };

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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.name ? "border border-red-400" : "border border-gray-300"
                }`}
              />
              {fieldErrors.name ? <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="text"
                inputMode="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.email ? "border border-red-400" : "border border-gray-300"
                }`}
              />
              {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                value={roleId}
                onChange={(e) => {
                  setRoleId(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, roleId: "" }));
                }}
                disabled={loadingRoles}
                className={`mt-1 block w-full rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.roleId ? "border border-red-400" : "border border-gray-300"
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
              {fieldErrors.roleId ? <p className="mt-1 text-xs text-red-600">{fieldErrors.roleId}</p> : null}
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
                disabled={loadingRoles || submitting}
              >
                {submitting ? "Adding..." : "Add User"}
              </button>
            </div>
          </form>
        </div> 
      </div>
    </div>
  );
}

export default Model;
 
