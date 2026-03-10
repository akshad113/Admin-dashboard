import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";

import HeroSection from "../components/HeroSection.jsx";
import ProductCard from "../components/ProductCard.jsx";
import TopNav from "../components/TopNav.jsx";
import { useAuthStore } from "../store/useAuthStore.js";
import { useShopStore } from "../store/useShopStore.js";

const formatRupees = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "NA";
  }
  return `Rs ${Math.round(parsed)}`;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "NA";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

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
  const cartSummary = useShopStore((state) => state.cartSummary);
  const cartLoading = useShopStore((state) => state.cartLoading);
  const cartError = useShopStore((state) => state.cartError);

  const orders = useShopStore((state) => state.orders);
  const ordersLoading = useShopStore((state) => state.ordersLoading);
  const orderError = useShopStore((state) => state.orderError);
  const orderSuccess = useShopStore((state) => state.orderSuccess);

  const setSearchTerm = useShopStore((state) => state.setSearchTerm);
  const setSelectedCategory = useShopStore((state) => state.setSelectedCategory);
  const loadHomeData = useShopStore((state) => state.loadHomeData);
  const addToCart = useShopStore((state) => state.addToCart);
  const loadCart = useShopStore((state) => state.loadCart);
  const loadOrders = useShopStore((state) => state.loadOrders);
  const placeOrder = useShopStore((state) => state.placeOrder);
  const incrementCartItem = useShopStore((state) => state.incrementCartItem);
  const decrementCartItem = useShopStore((state) => state.decrementCartItem);
  const removeCartItem = useShopStore((state) => state.removeCartItem);
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
    <div className="page-root">
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
                  onAddToCart={() => addToCart(product, token)}
                />
              ))}
            </div>
          ) : (
            <p className="status-message">No products match your current search.</p>
          )}
        </section>

        <section id="customer-cart" className="customer-section">
          <h2>Your cart</h2>

          {!customer ? (
            <p className="status-message">
              Login required for cart and checkout. <Link to="/login">Login now</Link>
            </p>
          ) : cartLoading ? (
            <p className="status-message">Loading cart...</p>
          ) : cartItems.length === 0 ? (
            <p className="status-message">Your cart is empty.</p>
          ) : (
            <div className="cart-card">
              <div className="cart-table-wrap">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.cart_item_id}>
                        <td>
                          <p className="cart-product-name">{item.product_name}</p>
                          <p className="cart-product-meta">{item.category_name || "General"}</p>
                        </td>
                        <td>{formatRupees(item.unit_price)}</td>
                        <td>
                          <div className="qty-controls">
                            <button
                              type="button"
                              onClick={() => decrementCartItem(item.product_id, token)}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => incrementCartItem(item.product_id, token)}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>{formatRupees(item.line_total)}</td>
                        <td>
                          <button
                            type="button"
                            className="remove-item-btn"
                            onClick={() => removeCartItem(item.product_id, token)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="cart-footer">
                <p>
                  Total ({cartSummary.itemCount} items): <strong>{formatRupees(cartSummary.totalAmount)}</strong>
                </p>
                <button type="button" className="checkout-btn" onClick={() => placeOrder(token)}>
                  Place Order
                </button>
              </div>
            </div>
          )}

          {cartError ? <p className="inline-error">{cartError}</p> : null}
          {orderError ? <p className="inline-error">{orderError}</p> : null}
          {orderSuccess ? <p className="inline-success">{orderSuccess}</p> : null}
        </section>

        <section id="customer-orders" className="customer-section">
          <h2>Your orders</h2>

          {!customer ? (
            <p className="status-message">Login required to view orders.</p>
          ) : ordersLoading ? (
            <p className="status-message">Loading orders...</p>
          ) : orders.length === 0 ? (
            <p className="status-message">No orders placed yet.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order.order_id} className="order-card">
                  <header>
                    <h3>Order #{order.order_id}</h3>
                    <p>{formatDateTime(order.created_at)}</p>
                  </header>
                  <p className="order-summary">
                    Status: <strong>{order.status}</strong> | Total: <strong>{formatRupees(order.total_amount)}</strong>
                  </p>
                  <ul>
                    {(order.items || []).map((item) => (
                      <li key={item.order_item_id}>
                        <span>{item.product_name}</span>
                        <span>
                          {item.quantity} x {formatRupees(item.unit_price)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
