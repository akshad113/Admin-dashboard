import { useEffect, useMemo } from "react";

import HeroSection from "../components/HeroSection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TopNav from "../components/TopNav.jsx";
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

  const cartItems = useShopStore((state) => state.cartItems);
  const setSearchTerm = useShopStore((state) => state.setSearchTerm);
  const setSelectedCategory = useShopStore((state) => state.setSelectedCategory);
  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const addToCart = useShopStore((state) => state.addToCart);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

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

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="page-root">
      <TopNav
        categories={categories}
        cartCount={cartCount}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        onSearchTermChange={setSearchTerm}
        onSelectedCategoryChange={setSelectedCategory}
      />

      <main className="home-main">
        <HeroSection />

        <section className="quick-categories">
          <h2>
            Shop by category <span className="result-count">({filteredCategories.length})</span>
          </h2>

          {isLoadingCategories ? (
            <p className="status-message">Loading categories...</p>
          ) : categoriesError ? (
            <div className="status-message error">
              <p>{categoriesError}</p>
              <button type="button" className="retry-button" onClick={loadHomeData}>
                Retry
              </button>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="category-grid">
              {filteredCategories.map((category) => (
                <article key={category.category_id} className="category-box">
                  <div className="category-art" aria-hidden="true" />
                  <h3>{category.name}</h3>
                </article>
              ))}
            </div>
          ) : (
            <p className="status-message">No categories match your current search.</p>
          )}
        </section>

        <section className="featured-products">
          <h2>
            Featured products <span className="result-count">({filteredProducts.length})</span>
          </h2>

          {isLoadingProducts ? (
            <p className="status-message">Loading products...</p>
          ) : productsError ? (
            <div className="status-message error">
              <p>{productsError}</p>
              <button type="button" className="retry-button" onClick={loadHomeData}>
                Retry
              </button>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <p className="status-message">No products match your current search.</p>
          )}
        </section>
      </main>
    </div>
  );
}
