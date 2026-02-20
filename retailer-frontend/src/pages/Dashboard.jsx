import Card from "../components/ui/Card";
import Table from "../components/ui/Table";

function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Quick summary of your retail store activity.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm font-semibold text-slate-500">Total Revenue</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">$48,920</p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">+12.4% this month</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-500">Orders</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">1,284</p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">+7.1% this week</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-500">Products Listed</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">326</p>
          <p className="mt-1 text-xs font-semibold text-sky-600">18 low-stock alerts</p>
        </Card>

        <Card>
          <p className="text-sm font-semibold text-slate-500">Pending Shipments</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">42</p>
          <p className="mt-1 text-xs font-semibold text-amber-600">Needs attention today</p>
        </Card>
      </div>

      <Table title="Recent Orders" subtitle="Latest order activity across your store.">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Order ID</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1021</td>
              <td className="px-5 py-4">Ava Watson</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Delivered</span>
              </td>
              <td className="px-5 py-4">$219.00</td>
              <td className="px-5 py-4">Feb 18, 2026</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1020</td>
              <td className="px-5 py-4">Noah Green</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Processing</span>
              </td>
              <td className="px-5 py-4">$149.50</td>
              <td className="px-5 py-4">Feb 18, 2026</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1019</td>
              <td className="px-5 py-4">Sophia Miles</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">Shipped</span>
              </td>
              <td className="px-5 py-4">$87.00</td>
              <td className="px-5 py-4">Feb 17, 2026</td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">#RT1018</td>
              <td className="px-5 py-4">Liam Cole</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Cancelled</span>
              </td>
              <td className="px-5 py-4">$64.99</td>
              <td className="px-5 py-4">Feb 17, 2026</td>
            </tr>
          </tbody>
        </table>
      </Table>
    </div>
  );
}

export default Dashboard;
