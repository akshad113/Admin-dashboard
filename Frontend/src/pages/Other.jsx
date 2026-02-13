function Offers() {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Offers & Coupons</h2>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm">
          + New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="font-medium">NEWUSER50</h3>
          <p className="text-sm text-gray-500">50% off for new users</p>
        </div>
      </div>
    </div>
  );
}

export default Offers;
