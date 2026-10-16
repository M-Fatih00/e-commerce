import { Link } from "react-router-dom";
import { IProductItem } from "../../model/IProduct";
import { getImageUrl } from "../../utils/image";
import { formatPrice } from "../../utils/format";
import "./ProductItem.css";

type Props = {
  productItem: IProductItem;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <ul className="product-star" aria-label={`5 üzerinden ${rating.toFixed(1)} puan`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <li key={star}>
            <i className={`bi ${filled ? "bi-star-fill" : half ? "bi-star-half" : "bi-star"}`} />
          </li>
        );
      })}
    </ul>
  );
}

function ProductItem({ productItem }: Props) {
  const mainImageUrl = getImageUrl(productItem.mainImage);
  const hoverImageUrl = getImageUrl(productItem.hoverImage) || mainImageUrl;
  const hasHoverImage = !!productItem.hoverImage && productItem.hoverImage !== productItem.mainImage;
  const hasDiscount = productItem.oldPrice > productItem.newPrice;

  return (
    <div className="product-item glide__slide">
      <div className="product-image">
        <Link to={`/product/${productItem.id}`}>
          <img src={mainImageUrl} alt={productItem.name} className="img1" loading="lazy" />
          {hasHoverImage && (
            <img src={hoverImageUrl} alt="" aria-hidden="true" className="img2" loading="lazy" />
          )}
        </Link>
      </div>

      <div className="product-info">
        <Link to={`/product/${productItem.id}`} className="product-title">
          {productItem.name}
        </Link>

        <StarRating rating={productItem.averageRating ?? 0} />

        <div className="product-prices">
          <strong className="new-price">{formatPrice(productItem.newPrice)}</strong>
          {hasDiscount && <span className="old-price">{formatPrice(productItem.oldPrice)}</span>}
        </div>

        {productItem.discount > 0 && <span className="product-discount">-%{productItem.discount}</span>}
      </div>
    </div>
  );
}

export default ProductItem;