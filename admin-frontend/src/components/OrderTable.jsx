import React from "react";

function OrderTable() {
  const orders = [
    {
      id: "#10234",
      customer: "John Doe",
      product: "Wireless Headphones",
      amount: "₹7,500",
      payment: "Paid",
      paymentColor: "bg-green-100 text-green-700",
      status: "Shipped",
      statusColor: "bg-green-100 text-green-700",
    },
    {
      id: "#10233",
      customer: "Alice Smith",
      product: "Smartphone X",
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
      amount: "₹40,000",
      payment: "Failed",
      paymentColor: "bg-red-100 text-red-700",
      status: "Cancelled",
      statusColor: "bg-red-100 text-red-700",
    },
    {
      id: "#10231",
      customer: "Sara Wilson",
      product: "Nike Sneakers",
      amount: "₹3,200",
      payment: "Paid",
      paymentColor: "bg-green-100 text-green-700",
      status: "Delivered",
      statusColor: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="font-semibold text-lg mb-4">Recent Orders</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-500 border-b">
            <tr>
              <th className="py-3">Order ID</th>
              <th className="py-3">Customer Name</th>
              <th className="py-3">Product</th>
              <th className="py-3">Amount</th>
              <th className="py-3">Payment Status</th>
              <th className="py-3">Order Status</th>
              <th className="py-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order, index) => (
              <tr
                key={index}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="py-4 font-medium">{order.id}</td>
                <td className="py-4">{order.customer}</td>
                <td className="py-4">{order.product}</td>
                <td className="py-4">{order.amount}</td>

                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.paymentColor}`}
                  >
                    {order.payment}
                  </span>
                </td>

                <td className="py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${order.statusColor}`}
                  >
                    {order.status}
                  </span>
                </td>

                <td className="py-4">
                  <div className="flex justify-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
                      👁️
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200">
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <button className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
          1
        </button>
        <button className="px-3 py-1 rounded border text-sm">2</button>
        <button className="px-3 py-1 rounded border text-sm">3</button>
        <button className="px-3 py-1 rounded border text-sm">Next</button>
      </div>
    </div>
  );
}

export default OrderTable;
