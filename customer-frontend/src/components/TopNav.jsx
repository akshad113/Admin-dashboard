import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

export default function TopNav({
  categories = [],
  cartCount = 0,
  customerName = "",
  searchTerm = "",
  selectedCategory = "All",
  onSearchTermChange,
  onSelectedCategoryChange,
  onLogout
}) {
  const categoryNames = [
    ...new Set(categories.map((category) => category.name).filter(Boolean))
  ];
  const subnavItems = categoryNames.length
    ? categoryNames.slice(0, 6)
    : ["Today's Deals", "Mobiles", "Fashion", "Electronics", "Home & Kitchen"];

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <header>
      <div className="amazon-nav">
        <a className="amazon-logo" href="#">
          shop<span>lane</span>
        </a>

        <div className="location-chip">
          <small>Deliver to</small>
          <strong>India</strong>
        </div>

        <form className="search-wrap" role="search" onSubmit={handleSubmit}>
          <select
            aria-label="Category"
            value={selectedCategory}
            onChange={(event) => onSelectedCategoryChange?.(event.target.value)}
          >
            <option value="All">All</option>
            {categoryNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search Shoplane"
            aria-label="Search"
            value={searchTerm}
            onChange={(event) => onSearchTermChange?.(event.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="nav-links">
          {customerName ? (
            <>
              <span className="account-pill">Hi, {customerName}</span>
              <button type="button" className="logout-link" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          )}
          <a href="#customer-orders">Orders</a>
          <a href="#customer-cart" className="cart-nav-link">
            <FaShoppingCart aria-hidden="true" />
            <span>Cart ({cartCount})</span>
          </a>
        </div>
      </div>

      <div className="amazon-subnav">
        {subnavItems.map((item) => (
          <a href="#" key={item}>
            {item}
          </a>
        ))}
      </div>
    </header>
  );
}
