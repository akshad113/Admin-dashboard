"use client";

import Link from "next/link";

import type { Product } from "../lib/types";
import { formatRupees, parseFeatures } from "../lib/formatters";

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

// Render one product tile with image, price, and add-to-cart action.
export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const discountPrice = product.mrp ? formatRupees(product.mrp) : null;
  const features = parseFeatures(product.features).slice(0, 3);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="relative overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-52 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-slate-100 via-amber-100 to-teal-100 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">
            No image
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-xs font-black text-slate-950">
          Sale
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
          {product.category_name || "General"}
        </p>
        <h3 className="line-clamp-2 text-sm font-bold text-slate-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-500">
          {product.description || "Carefully selected product for the customer catalog."}
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-500">
          <span>Rating</span> 
          <span>{product.rating ?? "4.5"}/5</span>
          <span className="text-slate-400">({product.review_count ?? 0})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-slate-900">{formatRupees(product.price)}</span>
          {discountPrice ? <span className="text-xs text-slate-400 line-through">{discountPrice}</span> : null}
        </div>

        {features.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <span key={feature} className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                {feature}
              </span>
            ))}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => onAddToCart(product)}
          className="mt-auto rounded-full bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Add to Cart
        </button>

        <Link
          href={`/products/${product.product_id}`}
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
