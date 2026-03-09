export default function TopNav() {
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

        <form className="search-wrap" role="search">
          <select aria-label="Category">
            <option>All</option>
            <option>Fashion</option>
            <option>Electronics</option>
            <option>Home</option>
          </select>
          <input type="text" placeholder="Search Shoplane" aria-label="Search" />
          <button type="submit">Search</button>
        </form>

        <div className="nav-links">
          <a href="#">Account</a>
          <a href="#">Orders</a>
          <a href="#">Cart (0)</a>
        </div>
      </div>

      <div className="amazon-subnav">
        <a href="#">Today's Deals</a>
        <a href="#">Mobiles</a>
        <a href="#">Fashion</a>
        <a href="#">Electronics</a>
        <a href="#">Home & Kitchen</a>
      </div>
    </header>
  );
}
