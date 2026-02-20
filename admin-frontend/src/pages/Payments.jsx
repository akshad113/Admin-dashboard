function Payments() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Payments</h2>

      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="py-3">Transaction ID</th>
            <th>User</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-gray-50">
            <td className="py-4">TXN89321</td>
            <td>John Doe</td>
            <td>₹7,500</td>
            <td>UPI</td>
            <td>
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                Success
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Payments;
