"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import CustomerHeader from "../../../components/CustomerHeader";
import SectionHeading from "../../../components/SectionHeading";
import { formatDateTime, formatRupees, parseFeatures } from "../../../lib/formatters";
import { requestApi } from "../../../lib/api";
import type { Product, ProductResponse } from "../../../lib/types";
import { useAuthStore } from "../../../store/useAuthStore";
import { useShopStore } from "../../../store/useShopStore";

// Render the customer product detail page.
export default function ProductDetailPage() {
  const params = useParams<{ productId?: string | string[] }>();
  const productId = Array.isArray(params?.productId) ? params.productId[0] : params?.productId;
  const token = useAuthStore((state) => state.token);
  const customer = useAuthStore((state) => state.user);
  const logoutCustomer = useAuthStore((state) => state.logoutCustomer);
  const cartSummary = useShopStore((state) => state.cartSummary);
  const products = useShopStore((state) => state.products);
  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const addToCart = useShopStore((state) => state.addToCart);
  const resetShopSession = useShopStore((state) => state.resetShopSession);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (products.length === 0) {
      loadHomeData();
    }
  }, [loadHomeData, products.length]);

  useEffect(() => {
    let isMounted = true;

    const loadProduct = async () => {
      if (!productId) {
        setLoading(false);
        setError("Invalid product link");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await requestApi<ProductResponse>(`/api/customer/products/${productId}`);
        const resolvedProduct = response.data ?? response.product ?? null;

        if (!resolvedProduct) {
          throw new Error("Product not found");
        }

        if (isMounted) {
          setProduct(resolvedProduct);
        }
      } catch (requestError) {
        if (isMounted) {
          setProduct(null);
          setError(requestError instanceof Error ? requestError.message : "Unable to load product");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const relatedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((entry) => {
        if (entry.product_id === product.product_id) {
          return false;
        }

        if (String(entry.status || "").toLowerCase() !== "active") {
          return false;
        }

        return (
          entry.category_name === product.category_name ||
          entry.subcategory_name === product.subcategory_name
        );
      })
      .slice(0, 4);
  }, [product, products]);

  // Log the customer out and clear the shopping session.
  const handleLogout = () => {
    logoutCustomer();
    resetShopSession();
  };

  const featureList = parseFeatures(product?.features);
  const hasSavings =
    product && product.mrp && Number(product.mrp) > Number(product.price)
      ? Number(product.mrp) - Number(product.price)
      : 0;

  return (
    <div className="min-h-screen">
      <CustomerHeader cartCount={cartSummary.itemCount} customer={customer} onLogout={handleLogout} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Product</p>
            <h1 className="mt-2 font-display text-3xl font-black text-slate-900">Product Details</h1>
            <p className="mt-2 text-sm text-slate-500">
              Explore the product before adding it to your cart.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            Back to shop
          </Link>
        </div>

        {loading ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            Loading product...
          </div>
        ) : error ? (
          <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 shadow-sm">
            <p>{error}</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white"
            >
              Return home
            </Link>
          </div>
        ) : product ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full min-h-[360px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[360px] items-center justify-center bg-gradient-to-br from-slate-100 via-amber-100 to-teal-100 text-sm font-bold uppercase tracking-[0.3em] text-slate-400">
                    No image available
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-slate-600">
                    {product.category_name || "General"}
                  </span>
                  {product.subcategory_name ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-amber-700">
                      {product.subcategory_name}
                    </span>
                  ) : null}
                  {product.brand ? (
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em] text-teal-700">
                      {product.brand}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900">{product.name}</h2>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-black text-slate-900">{formatRupees(product.price)}</span>
                  {product.mrp ? (
                    <span className="text-sm text-slate-400 line-through">{formatRupees(product.mrp)}</span>
                  ) : null}
                  {hasSavings > 0 ? (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      Save {formatRupees(hasSavings)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                      Rating
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {product.rating ?? "4.5"} / 5
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                      Reviews
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {product.review_count ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">
                      Stock
                    </p>
                    <p className="mt-2 text-lg font-bold text-slate-900">
                      {typeof product.stock_quantity === "number" ? product.stock_quantity : "NA"}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  {product.description || "This product has no description yet."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.25em]">
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
                    Listed {formatDateTime(product.created_at)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-600">
                    Status {String(product.status || "active")}
                  </span>
                </div>

                {featureList.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">
                      Highlights
                    </h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {featureList.map((feature) => (
                        <span
                          key={feature}
                          className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {customer ? (
                    <button
                      type="button"
                      onClick={() => addToCart(product, token)}
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                    >
                      Add to cart
                    </button>
                  ) : (
                    <Link
                      href="/login"
                      className="inline-flex flex-1 items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-amber-300"
                    >
                      Login to buy
                    </Link>
                  )}
                  <Link
                    href="/cart"
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    Go to cart
                  </Link>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  {customer
                    ? "Your cart and orders stay synced with your account."
                    : "Sign in to save this product to your cart and complete checkout."}
                </p>
              </div>
            </section>

            {relatedProducts.length > 0 ? (
              <section className="space-y-4">
                <SectionHeading
                  eyebrow="More Picks"
                  title="You may also like"
                  description="Other items from the same category or subcategory."
                  actionLabel={`${relatedProducts.length} items`}
                />

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {relatedProducts.map((relatedProduct) => (
                    <article
                      key={relatedProduct.product_id}
                      className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/10"
                    >
                      <Link href={`/products/${relatedProduct.product_id}`} className="block">
                        <div className="overflow-hidden rounded-[1.1rem] bg-slate-100">
                          {relatedProduct.image_url ? (
                            <img
                              src={relatedProduct.image_url}
                              alt={relatedProduct.name}
                              className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-44 items-center justify-center text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">
                              No image
                            </div>
                          )}
                        </div>
                        <p className="mt-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                          {relatedProduct.category_name || "General"}
                        </p>
                        <h3 className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">
                          {relatedProduct.name}
                        </h3>
                        <p className="mt-2 text-sm font-black text-slate-900">
                          {formatRupees(relatedProduct.price)}
                        </p>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
