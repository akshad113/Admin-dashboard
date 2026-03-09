const formatPrice = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? `$${parsed.toFixed(2)}` : "NA";
};

export default function ProductCard({ product, onAddToCart }) {
  return (
    <article className="product-card">
      {product.image_url ? (
        <img src={product.image_url} alt={product.name} className="product-image" />
      ) : (
        <div className="product-image-placeholder" aria-hidden="true" />
      )}

      <div className="product-meta">
        <h3>{product.name}</h3>
        <p className="product-category">
          {product.category_name || "General"}
          {product.subcategory_name ? ` - ${product.subcategory_name}` : ""}
        </p>
        <p className="product-price">{formatPrice(product.price)}</p>

        <button type="button" className="add-cart-button" onClick={() => onAddToCart(product)}>
          Add to Cart
        </button>
      </div>
    </article>
  );
}
