const formatPrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `Rs ${Math.round(parsed)}` : "NA";
};

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div
          className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-slate-100 to-amber-100 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
          aria-hidden="true"
        >
          Image
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm font-semibold text-slate-900">{product.name}</h3>
        <p className="text-xs text-slate-500">
          {product.category_name || "General"}
          {product.subcategory_name ? ` - ${product.subcategory_name}` : ""}
        </p>
        <p className="text-lg font-extrabold text-slate-900">{formatPrice(product.price)}</p>

        <button
          type="button"
          className="mt-auto rounded-full bg-amber-400 px-4 py-2 text-sm font-bold text-slate-900 transition hover:bg-amber-300"
          onClick={() => onAddToCart?.(product)}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
