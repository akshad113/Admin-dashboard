import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

const validateUpdateUser = ({ name, email, roleId, status }) => {
  const errors = {};
  const normalizedName = String(name || "").trim();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedStatus = String(status || "").trim().toLowerCase();
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

  if (!["active", "inactive"].includes(normalizedStatus)) {
    errors.status = "Status must be active or inactive";
  }

  return errors;
};

function EditUserModal({ user, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("active");
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email || "");
    setRoleId(user.role_id ? String(user.role_id) : "");
    setStatus((user.status || "active").toLowerCase());
  }, [user]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const validationErrors = validateUpdateUser({
      name,
      email,
      roleId,
      status,
    });

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSaving(true);

    try {
      await apiRequest(`/users/${user.user_id}`, {
        method: "PUT", // your backend route
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role_id: Number(roleId),
          status: String(status).toLowerCase(),
        }),
      });

      await onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative mx-auto mt-20 w-[95%] max-w-xl rounded-xl bg-white p-6 shadow-2xl">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit User</h3>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <input
            className={`w-full rounded-lg px-3 py-2 ${
              fieldErrors.name ? "border border-red-400" : "border border-slate-300"
            }`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setFieldErrors((prev) => ({ ...prev, name: "" }));
            }}
            placeholder="Name"
          />
          {fieldErrors.name ? <p className="text-xs text-red-600">{fieldErrors.name}</p> : null}

          <input
            type="text"
            inputMode="email"
            className={`w-full rounded-lg px-3 py-2 ${
              fieldErrors.email ? "border border-red-400" : "border border-slate-300"
            }`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: "" }));
            }}
            placeholder="Email"
          />
          {fieldErrors.email ? <p className="text-xs text-red-600">{fieldErrors.email}</p> : null}

          <select
            className={`w-full rounded-lg px-3 py-2 ${
              fieldErrors.roleId ? "border border-red-400" : "border border-slate-300"
            }`}
            value={roleId}
            onChange={(e) => {
              setRoleId(e.target.value);
              setFieldErrors((prev) => ({ ...prev, roleId: "" }));
            }}
            disabled={loadingRoles}
          >
            <option value="">{loadingRoles ? "Loading roles..." : "Select role"}</option>
            {roles.map((r) => (
              <option key={r.role_id} value={r.role_id}>
                {r.role_name}
              </option>
            ))}
          </select>
          {fieldErrors.roleId ? <p className="text-xs text-red-600">{fieldErrors.roleId}</p> : null}

          <select
            className={`w-full rounded-lg px-3 py-2 ${
              fieldErrors.status ? "border border-red-400" : "border border-slate-300"
            }`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setFieldErrors((prev) => ({ ...prev, status: "" }));
            }}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {fieldErrors.status ? <p className="text-xs text-red-600">{fieldErrors.status}</p> : null}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loadingRoles}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;