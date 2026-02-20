function Reports() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Reports</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">Monthly Sales</p>
          <h3 className="text-xl font-bold">₹4,50,000</h3>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-gray-500">New Users</p>
          <h3 className="text-xl font-bold">320</h3>
        </div>
      </div>
    </div>
  );
}

export default Reports;
