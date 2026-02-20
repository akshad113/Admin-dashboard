import Button from "../components/ui/Button";
import Table from "../components/ui/Table";

function Orders() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Track order status and fulfillment progress.</p>
        </div>
        <Button variant="secondary">Export Orders</Button>
      </div>

      <Table title="All Orders" subtitle="Static order table for UI layout demonstration.">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Order ID</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Items</th>
              <th className="px-5 py-3 font-semibold">Amount</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1102</td>
              <td className="px-5 py-4">Mia Turner</td>
              <td className="px-5 py-4">3</td>
              <td className="px-5 py-4">$240.00</td>
              <td className="px-5 py-4">Paid</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Shipped</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1101</td>
              <td className="px-5 py-4">Ethan Ross</td>
              <td className="px-5 py-4">1</td>
              <td className="px-5 py-4">$89.00</td>
              <td className="px-5 py-4">Paid</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Processing</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1100</td>
              <td className="px-5 py-4">Olivia Hart</td>
              <td className="px-5 py-4">2</td>
              <td className="px-5 py-4">$162.00</td>
              <td className="px-5 py-4">Refunded</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Returned</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1099</td>
              <td className="px-5 py-4">Lucas King</td>
              <td className="px-5 py-4">5</td>
              <td className="px-5 py-4">$510.00</td>
              <td className="px-5 py-4">Pending</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Pending</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Table>
    </div>
  );
}

export default Orders;
