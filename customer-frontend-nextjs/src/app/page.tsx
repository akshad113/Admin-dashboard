"use client";

import { useEffect, useMemo, useState } from "react";

import CustomerHeader from "../components/CustomerHeader";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/ProductCard";
import SectionHeading from "../components/SectionHeading";
import { formatRupees } from "../lib/formatters";
import { useAuthStore } from "../store/useAuthStore";
import { useShopStore } from "../store/useShopStore";

// Render the customer home page with search, categories, and featured products.
export default function HomePage() {
  const categories = useShopStore((state) => state.categories);
  const products = useShopStore((state) => state.products);
  const searchTerm = useShopStore((state) => state.searchTerm);
  const selectedCategory = useShopStore((state) => state.selectedCategory);
  const isLoadingCategories = useShopStore((state) => state.isLoadingCategories);
  const isLoadingProducts = useShopStore((state) => state.isLoadingProducts);
  const categoriesError = useShopStore((state) => state.categoriesError);
  const productsError = useShopStore((state) => state.productsError);
  const cartSummary = useShopStore((state) => state.cartSummary);
  const setSearchTerm = useShopStore((state) => state.setSearchTerm);
  const setSelectedCategory = useShopStore((state) => state.setSelectedCategory);
  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const addToCart = useShopStore((state) => state.addToCart);
  const loadCart = useShopStore((state) => state.loadCart);
  const loadOrders = useShopStore((state) => state.loadOrders);
  const resetShopSession = useShopStore((state) => state.resetShopSession);
  const token = useAuthStore((state) => state.token);
  const customer = useAuthStore((state) => state.user);
  const logoutCustomer = useAuthStore((state) => state.logoutCustomer);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  useEffect(() => {
    if (!token) {
      resetShopSession();
      return;
    }

    loadCart(token);
    loadOrders(token);
  }, [token, loadCart, loadOrders, resetShopSession]);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  // Build a reusable list of category names for filters and display.
  const categoryNames = useMemo(() => categories.map((category) => category.name), [categories]);

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesCategory =
          selectedCategory === "All" || category.name === selectedCategory;
        const matchesSearch =
          !normalizedSearch || category.name.toLowerCase().includes(normalizedSearch);

        return matchesCategory && matchesSearch;
      }),
    [categories, normalizedSearch, selectedCategory]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (String(product.status).toLowerCase() === "inactive") {
          return false;
        }

        const matchesCategory =
          selectedCategory === "All" || product.category_name === selectedCategory;
        const searchText = [
          product.name,
          product.description,
          product.category_name,
          product.subcategory_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return matchesCategory && (!normalizedSearch || searchText.includes(normalizedSearch));
      }),
    [products, normalizedSearch, selectedCategory]
  );

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredProducts.slice(start, end);
  }, [filteredProducts, currentPage]);

  // Log the customer out and clear the shopping session.
  const handleLogout = () => {
    logoutCustomer();
    resetShopSession();
  };

  return (
    <div className="min-h-screen">
      <CustomerHeader cartCount={cartSummary.itemCount} customer={customer} onLogout={handleLogout} />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <HeroSection />

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                Search products
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search for products, brands, or categories"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
                Category
              </span>
              <select
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setCurrentPage(1);
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none ring-amber-300 focus:ring-2"
              >
                <option value="All">All</option>
                {categoryNames.map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <section id="categories" className="space-y-4">
          <SectionHeading
            eyebrow="Browse"
            title="Shop by category"
            description="Find products quickly using a clean category grid that works on desktop and mobile."
            actionLabel={`${filteredCategories.length} results`}
          />

          {isLoadingCategories ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Loading categories...
            </div>
          ) : categoriesError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p>{categoriesError}</p>
              <button
                type="button"
                className="mt-3 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white"
                onClick={loadHomeData}
              >
                Retry
              </button>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {filteredCategories.map((category) => (
                <article
                  key={category.category_id}
                  className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="h-24 rounded-[1rem] bg-gradient-to-br from-slate-100 via-sky-100 to-amber-100" />
                  <h3 className="mt-3 text-sm font-semibold text-slate-800">{category.name}</h3>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No categories match your current search.
            </div>
          )}
        </section>

        <section id="featured-products" className="space-y-4">
          <SectionHeading
            eyebrow="Spotlight"
            title="Featured products"
            description={`Handpicked items for the catalog. ${formatRupees(8199)} is our starting example price.`}
            actionLabel={`${filteredProducts.length} results`}
          />

          {isLoadingProducts ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Loading products...
            </div>
          ) : productsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p>{productsError}</p>
              <button
                type="button"
                className="mt-3 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white"
                onClick={loadHomeData}
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.product_id}
                    product={product}
                    onAddToCart={() => addToCart(product, token)}
                  />
                ))}
              </div>

              {totalPages > 1 ? (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    Previous
                  </button>

                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">
                    Page {currentPage} of {totalPages}
                  </p>

                  <button
                    type="button"
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              No products match your current search.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
