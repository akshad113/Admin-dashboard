import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { apiRequest } from "../lib/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formState, setFormState] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = await apiRequest("/retailer/profile/me");
      const user = payload?.user || null;
      setProfile(user);
      setFormState({
        name: user?.name || "",
        email: user?.email || ""
      });
    } catch (requestError) {
      setProfile(null);
      setError(requestError.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = await apiRequest("/retailer/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          email: formState.email.trim()
        })
      });

      setProfile(payload?.user || null);
      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your store and account details.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card title="Account Details" subtitle="Update the retailer profile used across the panel.">
          {loading ? (
            <p className="text-sm text-slate-500">Loading profile...</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Name</label>
                <input
                  name="name"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                  value={formState.name}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"
                  value={formState.email}
                  onChange={handleChange}
                />
              </div>

              {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
              {success ? <p className="text-sm font-medium text-emerald-600">{success}</p> : null}

              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </Card>

        <Card title="Store Snapshot" subtitle="Key account metadata pulled from the database.">
          {loading ? (
            <p className="text-sm text-slate-500">Loading details...</p>
          ) : profile ? (
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Retailer ID</span>
                <span className="font-semibold text-slate-900">{profile.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-emerald-700">{profile.status}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Roles</span>
                <span className="font-semibold text-slate-900">
                  {(profile.roles || []).join(", ") || "Retailer"}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No profile data found.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default Profile;
