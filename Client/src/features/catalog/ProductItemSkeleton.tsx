import "./ProductItem.css";

function ProductItemSkeleton() {
  return (
    <div className="product-item product-item-skeleton" aria-hidden="true">
      <span className="skeleton-block product-skeleton-image" />
      <div className="product-info">
        <span className="skeleton-block product-skeleton-title" />
        <span className="skeleton-block product-skeleton-stars" />
        <span className="skeleton-block product-skeleton-price" />
      </div>
    </div>
  );
}

export default ProductItemSkeleton;