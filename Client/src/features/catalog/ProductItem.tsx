import { Link } from "react-router-dom";
import { IProductItem } from "../../model/IProduct";
import { getImageUrl } from "../../utils/image";
import "./ProductItem.css";

type Props = {
  productItem: IProductItem;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <ul className="product-star">
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
  const mainImageUrl = getImageUrl(productItem.mainImage ?? "");
  const hoverImageUrl = getImageUrl(productItem.hoverImage ?? "") || mainImageUrl;

  const discountPrice =
    productItem.newPrice - (productItem.newPrice * productItem.discount) / 100;

  return (
    <div className="product-item glide__slide">
      <div className="product-image">
        <Link to={`/product/${productItem.id}`}>
          <img
            src={mainImageUrl}
            alt={productItem.name}
            className="img1"
            loading="lazy"
          />
          {productItem.hoverImage && (
            <img
              src={hoverImageUrl}
              alt={productItem.name}
              className="img2"
              loading="lazy"
            />
          )}
        </Link>
      </div>

      <div className="product-info">
        <Link to={`/product/${productItem.id}`} className="product-title">
          {productItem.name}
        </Link>

        <StarRating rating={productItem.averageRating ?? 0} />

        <div className="product-prices">
          <strong className="new-price">${discountPrice.toFixed(2)}</strong>
          <span className="old-price">${productItem.newPrice.toFixed(2)}</span>
        </div>

        <span className="product-discount">-{productItem.discount}%</span>

        <div className="product-links">
          <button><i className="bi bi-basket-fill"></i></button>
          <button><i className="bi bi-heart-fill"></i></button>
          <a href="#"><i className="bi bi-eye-fill"></i></a>
          <a href="#"><i className="bi bi-share-fill"></i></a>
        </div>
      </div>
    </div>
  );
}

export default ProductItem;