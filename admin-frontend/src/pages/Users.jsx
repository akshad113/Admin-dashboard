import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Model from "../components/Model";
import { apiRequest } from "../lib/api";
import EditUserModal from "../components/EditUserModal";

function Users() {
  const [editingUser, setEditingUser] = useState(null);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const getInitials = (name) => {
    const parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const getAvatarStyle = (name) => {
    const palettes = [
      "from-rose-500 to-pink-500",
      "from-emerald-500 to-teal-500",
      "from-blue-500 to-cyan-500",
      "from-violet-500 to-indigo-500",
      "from-amber-500 to-orange-500",
      "from-fuchsia-500 to-purple-500",
      "from-sky-500 to-blue-600",
      "from-lime-500 to-green-600",
    ];

    const key = String(name || "")
      .split("")
      .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

    return palettes[key % palettes.length];
  };

  const getStatusClasses = (status) => {
    const value = String(status || "").toLowerCase();
    if (value.includes("active")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    if (value.includes("pending")) return "bg-amber-50 text-amber-700 ring-amber-200";
    if (value.includes("blocked") || value.includes("inactive")) {
      return "bg-rose-50 text-rose-700 ring-rose-200";
    }
    return "bg-slate-50 text-slate-600 ring-slate-200";
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await apiRequest("/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      console.error(err);
      setError(err.message || "Failed to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleToggleStatus = async (userId) => {
    try {
      await apiRequest(`/users/${userId}/status`, { method: "PUT" });
      await loadUsers();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update status");
    }
  };

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    setPage(1);
  }, [users.length]);

  const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
  const startIndex = (page - 1) * pageSize;
  const visibleUsers = users.slice(startIndex, startIndex + pageSize);
  const showingFrom = users.length === 0 ? 0 : startIndex + 1;
  const showingTo = Math.min(startIndex + pageSize, users.length);
  const activeCount = users.filter((u) => String(u.status || "").toLowerCase() === "active").length;
  const inactiveCount =users.filter((u) => String(u.status || "").toLowerCase() !== "active").length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-lg">
      {/* Render modal only when open */}
      {isModalOpen && (
        <Model
          onClose={() => setIsModalOpen(false)}
          onUserCreated={loadUsers}
        />
      )}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={loadUsers}
        />
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Users</h2>
          <p className="mt-1 text-sm text-slate-500">Manage accounts, roles, and user status</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          + Add User
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{users.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Active</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Inactive</p>
          <p className="mt-2 text-2xl font-bold text-rose-700">{inactiveCount}</p>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th className="px-4 py-3 text-left">User</th>
            <th className="px-4 text-left">Email</th>
            <th className="px-4 text-left">Role</th>
            <th className="px-4 text-left">Status</th>
            <th className="px-4 text-center">Actions</th>
          </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-slate-500">
                Loading users...
              </td>
            </tr>
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center py-6 text-slate-500">
                No users found
              </td>
            </tr>
          ) : (
            visibleUsers.map((u) => (
              <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarStyle(
                        u.name
                      )} text-xs font-bold text-white shadow-sm`}
                    >
                      {getInitials(u.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{u.name}</p>
                      <p className="text-xs text-slate-500">ID: {u.user_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 text-slate-700">{u.email}</td>
                <td className="px-4 text-slate-700">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {u.role_name || "No role"}
                  </span>
                </td>
                <td className="px-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(u.status)}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 text-center">
                  <button
                    className="mr-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                    onClick={() => setEditingUser(u)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                    onClick={() => handleToggleStatus(u.user_id)}
                  >
                    {(String(u.status || "").toLowerCase() === "active")
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
        <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium">
          Showing {showingFrom}-{showingTo} of {users.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>
          <span className="min-w-[110px] text-center font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
 
export default Users;
