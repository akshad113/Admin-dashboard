import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api";

function EditUserModal({ user, onClose, onSaved }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState("");
  const [status, setStatus] = useState("active");
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setSaving(true);

    try {
      await apiRequest(`/users/${user.user_id}`, {
        method: "PUT", // your backend route
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role_id: roleId ? Number(roleId) : null,
          status,
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />

          <input
            type="email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            disabled={loadingRoles}
          >
            <option value="">{loadingRoles ? "Loading roles..." : "Select role"}</option>
            {roles.map((r) => (
              <option key={r.role_id} value={r.role_id}>
                {r.role_name}
              </option>
            ))}
          </select>

          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg bg-slate-200 px-4 py-2">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
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
