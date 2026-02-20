function Products() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
          + Add Product
        </button>
      </div>

      <table className="w-full text-sm">
        <thead className="text-gray-500 border-b">
          <tr>
            <th className="py-3">Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b hover:bg-gray-50">
            <td className="py-4">Wireless Headphones</td>
            <td>Electronics</td>
            <td>₹7,500</td>
            <td>24</td>
            <td>
              <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                In Stock
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Products;
