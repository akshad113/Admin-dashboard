const formatPrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `Rs ${Math.round(parsed)}` : "NA";
};

export default function ProductCard({ product, onAddToCart }) {
  const price = Number(product.price);
  const oldPrice = Math.round(price * 1.2);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl">
      
      {/* Image Section */}
      <div className="relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-amber-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Image
          </div>
        )}

        {/* Discount badge */}
        <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
          Sale
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">

        {/* Category */}
        <p className="text-xs text-slate-500">
          {product.category_name || "General"}
        </p>

        {/* Product Name */}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center text-amber-400 text-xs">
          ★★★★☆
          <span className="ml-1 text-slate-500">(120)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(price)}
          </span>

          <span className="text-xs text-slate-400 line-through">
            Rs {oldPrice}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={() => onAddToCart?.(product)}
          className="mt-auto rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}