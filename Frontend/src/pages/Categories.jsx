function Categories() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Categories</h2>

      <ul className="space-y-3">
        {["Electronics", "Fashion", "Home Appliances", "Sports"].map(
          (cat, i) => (
            <li
              key={i}
              className="flex justify-between items-center p-3 rounded-lg border hover:bg-gray-50"
            >
              <span>{cat}</span>
              <button className="text-blue-600 text-sm">Edit</button>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default Categories;
