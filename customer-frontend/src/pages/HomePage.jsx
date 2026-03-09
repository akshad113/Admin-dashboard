import HeroSection from "../components/HeroSection.jsx";
import TopNav from "../components/TopNav.jsx";

const categoryData = [
  "Top Offers",
  "Bestsellers",
  "New Launches",
  "Groceries",
  "Beauty",
  "Appliances"
];

export default function HomePage() {
  return (
    <div className="page-root">
      <TopNav />

      <main className="home-main">
        <HeroSection />

        <section className="quick-categories">
          <h2>Shop by category</h2>
          <div className="category-grid">
            {categoryData.map((name) => (
              <article key={name} className="category-box">
                <div className="category-art" aria-hidden="true" />
                <h3>{name}</h3>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
