import { useEffect, useMemo } from "react";
import HeroSection from "../components/HeroSection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TopNav from "../components/TopNav.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { useShopStore } from "../store/useShopStore.js";

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

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) => {
        const matchesCategoryFilter =
          selectedCategory === "All" || category.name === selectedCategory;
        const matchesSearch =
          !normalizedSearch || category.name.toLowerCase().includes(normalizedSearch);

        return matchesCategoryFilter && matchesSearch;
      }),
    [categories, normalizedSearch, selectedCategory]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        if (String(product.status).toLowerCase() === "inactive") {
          return false;
        }

        const matchesCategoryFilter =
          selectedCategory === "All" || product.category_name === selectedCategory;
        const searchHaystack = [
          product.name,
          product.description,
          product.category_name,
          product.subcategory_name
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch = !normalizedSearch || searchHaystack.includes(normalizedSearch);
        return matchesCategoryFilter && matchesSearch;
      }),
    [products, normalizedSearch, selectedCategory]
  );

  const handleLogout = () => {
    logoutCustomer();
    resetShopSession();
  };

  return (
    <div className="min-h-screen">
      <TopNav
        categories={categories}
        cartCount={cartSummary.itemCount}
        customerName={customer?.name || ""}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchTermChange={setSearchTerm}
        onSelectedCategoryChange={setSelectedCategory}
        onLogout={handleLogout}
      />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16 pt-8">
        <HeroSection />

        <section id="categories" className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Browse
              </p>
              <h2 className="text-2xl font-bold text-slate-900">Shop by category</h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {filteredCategories.length} results
            </span>
          </div>

          {isLoadingCategories ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Loading categories...
            </div>
          ) : categoriesError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p>{categoriesError}</p>
              <button
                type="button"
                className="mt-3 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white"
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
                  className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div
                    className="h-24 rounded-xl bg-gradient-to-br from-slate-100 via-sky-100 to-amber-100"
                    aria-hidden="true"
                  />
                  <h3 className="mt-3 text-sm font-semibold text-slate-800">
                    {category.name}
                  </h3>
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
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
                Spotlight
              </p>
              <h2 className="text-2xl font-bold text-slate-900">Featured products</h2>
            </div>
            <span className="text-sm font-semibold text-slate-500">
              {filteredProducts.length} results
            </span>
          </div>

          {isLoadingProducts ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              Loading products...
            </div>
          ) : productsError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              <p>{productsError}</p>
              <button
                type="button"
                className="mt-3 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white"
                onClick={loadHomeData}
              >
                Retry
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onAddToCart={() => addToCart(product, token)}
                />
              ))}
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
