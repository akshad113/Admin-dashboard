import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";

function Products() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Product Management</h1>
        <p className="mt-1 text-sm text-slate-500">Create and review your catalog items.</p>
      </div>

      <Card title="Add Product" subtitle="Static form UI for adding a new product.">
        <form className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Product Name</label>
            <input
              type="text"
              placeholder="Premium Cotton T-Shirt"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Category</label>
            <select className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm">
              <option>Apparel</option>
              <option>Electronics</option>
              <option>Home</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Price</label>
            <input type="text" placeholder="$49.00" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Stock Quantity</label>
            <input type="text" placeholder="120" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
            <textarea
              rows="4"
              placeholder="Write a short product description..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <Button type="button">Save Product</Button>
          </div>
        </form>
      </Card>

      <Table title="Product List" subtitle="Static preview of catalog items.">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">SKU</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Stock</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">Noise Cancelling Headphones</td>
              <td className="px-5 py-4">HDP-2201</td>
              <td className="px-5 py-4">$129.00</td>
              <td className="px-5 py-4">56</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Active</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">Minimalist Desk Lamp</td>
              <td className="px-5 py-4">LMP-8742</td>
              <td className="px-5 py-4">$72.00</td>
              <td className="px-5 py-4">14</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Low Stock</span>
              </td>
            </tr>
            <tr className="hover:bg-slate-50">
              <td className="px-5 py-4 font-semibold">Running Sneakers</td>
              <td className="px-5 py-4">SNK-4439</td>
              <td className="px-5 py-4">$98.00</td>
              <td className="px-5 py-4">0</td>
              <td className="px-5 py-4">
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">Out of Stock</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Table>
    </div>
  );
}

export default Products;
