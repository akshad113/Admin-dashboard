const spotlight = [
  { title: "Smart Watches", text: "Starting at $49" },
  { title: "Summer Fashion", text: "Up to 60% off" },
  { title: "Home Refresh", text: "Top picks under $30" }
];

export default function HeroSection() {
  return (
    <section className="hero-shell">
      <div className="hero-banner">
        <p className="hero-kicker">New user offer: free shipping for 7 days</p>
        <h1>Discover deals that feel like Amazon, built for your store.</h1>
        <p>
          Shop daily essentials, latest gadgets, and trending styles with lightning-fast checkout.
        </p>
        <div className="hero-actions">
          <button type="button">Shop Deals</button>
          <a href="#">Browse Categories</a>
        </div>
      </div>

      <div className="hero-cards">
        {spotlight.map((item) => (
          <article key={item.title} className="deal-card">
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
