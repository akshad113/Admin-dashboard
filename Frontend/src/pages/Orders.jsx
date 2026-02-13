import React from "react";

function Orders() {
  const orders = [
    {
      id: "#10234",
      customer: "John Doe",
      product: "Wireless Headphones",
      date: "12 Aug 2024",
      amount: "₹7,500",
      payment: "Paid",
      paymentColor: "bg-green-100 text-green-700",
      status: "Shipped",
      statusColor: "bg-blue-100 text-blue-700",
    },
    {
      id: "#10233",
      customer: "Alice Smith",
      product: "Smartphone X",
      date: "11 Aug 2024",
      amount: "₹25,000",
      payment: "Pending",
      paymentColor: "bg-yellow-100 text-yellow-700",
      status: "Processing",
      statusColor: "bg-orange-100 text-orange-700",
    },
    {
      id: "#10232",
      customer: "Michael Lee",
      product: "4K LED TV",
      date: "10 Aug 2024",
      amount: "₹40,000",
      payment: "Failed",
      paymentColor: "bg-red-100 text-red-700",
      status: "Cancelled",
      statusColor: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-xl font-semibold">Orders</h2>

        <div className="flex gap-2">
          <select className="border rounded-lg px-3 py-2 text-sm">
            <option>All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>

          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-3">Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="py-4 font-medium">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td>{order.date}</td>
                <td>{order.amount}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentColor}`}
                  >
                    {order.payment}
                  </span>
                </td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="text-center">
                  <button className="text-blue-600 hover:underline text-sm">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-6 gap-2">
        <button className="px-3 py-1 border rounded-lg text-sm">Prev</button>
        <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm">
          1
        </button>
        <button className="px-3 py-1 border rounded-lg text-sm">2</button>
        <button className="px-3 py-1 border rounded-lg text-sm">Next</button>
      </div>
    </div>
  );
}

export default Orders;
