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

      
    </div>
  );
}

export default Orders;
