import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Model from "../components/Model";
import { apiRequest } from "../lib/api";

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- modal state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);


  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Render modal only when open */}
      {isModalOpen && (
        <Model
          onClose={() => setIsModalOpen(false)}
          onUserCreated={loadUsers}
        />
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Users</h2>
        <button
          onClick={() => setIsModalOpen(true)} // <-- open modal on click
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          + Add User
        </button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 border-b text-xs uppercase tracking-wide">
          <tr>
            <th className="py-3 px-4 text-left">Name</th>
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
            users.map((u) => (
              <tr key={u.user_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-4 px-4 font-medium text-slate-900">{u.name}</td>
                <td className="px-4 text-slate-700">{u.email}</td>
                <td className="px-4 text-slate-700">{u.role_name}</td>
                <td className="px-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(u.status)}`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 text-center">
                  <button className="text-blue-600 hover:text-blue-700 hover:underline mr-3">
                    Edit
                  </button>
                  <button className="text-red-600 hover:text-red-700 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
