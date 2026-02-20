function Settings() {
  return (
    <div className="bg-white rounded-xl shadow p-6 max-w-xl">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Company Name</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2"
            placeholder="tnpLab Pvt Ltd"
          />
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          Save Changes
        </button>
      </div>
    </div>
  );
}

export default Settings;
