import { useRef, useState } from "react";
import { IProductDetail } from "../../../../model/IProductDetail";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { addItem } from "../../../cart/cartSlice";
import { message } from "antd";
import "./Info.css";

interface InfoProps {
  singleProduct: IProductDetail;
}

const ALL_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

function StarRating({ rating }: { rating: number }) {
  return (
    <ul className="product-star">
      {[1, 2, 3, 4, 5].map((star) => (
        <li key={star}>
          <i
            className={`bi ${rating >= star ? "bi-star-fill" : rating >= star - 0.5 ? "bi-star-half" : "bi-star"}`}
          />
        </li>
      ))}
    </ul>
  );
}

function Info({ singleProduct }: InfoProps) {
  const quantityRef = useRef<HTMLInputElement | null>(null);
  const dispatch = useAppDispatch();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [added, setAdded] = useState(false);
  const { user } = useAppSelector((state) => state.auth);

  const discountedPrice =
    singleProduct.newPrice -
    (singleProduct.newPrice * singleProduct.discount) / 100;
  const averageRating = singleProduct.averageRating ?? 0;
  const reviewCount = singleProduct.reviewCount ?? 0;

  const selectedSizeData = singleProduct.sizes?.find(
    (s) => s.size === selectedSize,
  );
  const selectedStock = selectedSizeData?.stock ?? null;
  const hasColors = singleProduct.colors && singleProduct.colors.length > 0;

  const handleAddToCart = () => {
    if (!user) {
      message.warning("Sepete eklemek için giriş yapmalısınız.");
      return;
    }
    const sizeErr = !selectedSize;
    const colorErr = !!(hasColors && !selectedColor);

    setSizeError(sizeErr);
    setColorError(colorErr);

    if (sizeErr || colorErr) return;
    if (selectedStock !== null && selectedStock <= 0) return;

    const miktar = Number(quantityRef.current?.value || 1);

    dispatch(
      addItem({
        urunId: singleProduct.id,
        miktar,
        beden: selectedSize ?? undefined,
        renk: selectedColor ?? undefined,
      }),
    )
      .unwrap()
      .then(() => {
        message.success("Ürün sepete eklendi!");
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      })
      .catch((rejected: any) => {
        const backendMsg = rejected?.error;
        message.error(
          backendMsg?.message || backendMsg?.title || "Ürün sepete eklenemedi.",
        );
      });
  };

  const handleSizeSelect = (size: string) => {
    const sizeData = singleProduct.sizes?.find((s) => s.size === size);
    if (!sizeData || sizeData.stock <= 0) return;
    setSelectedSize(size);
    setSizeError(false);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setColorError(false);
  };

  return (
    <div className="product-info">
      <h1 className="product-title">{singleProduct.name}</h1>

      {/* REVIEW */}
      <div className="product-review">
        <StarRating rating={averageRating} />
        <span>
          {reviewCount > 0 ? `${reviewCount} yorum` : "Henüz yorum yok"}
        </span>
      </div>

      {/* PRICE */}
      <div className="product-price">
        <s className="old-price">${singleProduct.oldPrice.toFixed(2)}</s>
        <strong className="new-price">${discountedPrice.toFixed(2)}</strong>
      </div>

      {/* DESCRIPTION */}
      <div
        className="product-description"
        dangerouslySetInnerHTML={{ __html: singleProduct.description }}
      />

      {/* VARIATIONS */}
      <form className="variations-form">
        <div className="variations">
          {/* COLORS */}
          {hasColors && (
            <div className="colors">
              <div className="colors-label">
                <span>
                  Renk
                  {selectedColor && (
                    <strong style={{ marginLeft: 8, color: "#1a1a2e" }}>
                      — {selectedColor}
                    </strong>
                  )}
                </span>
              </div>
              <div className="colors-wrapper">
                {singleProduct.colors!.map((color, index) => (
                  <div className="color-wrapper" key={index}>
                    <label
                      onClick={() => handleColorSelect(color)}
                      style={{
                        backgroundColor: color,
                        cursor: "pointer",
                        outline:
                          selectedColor === color
                            ? "3px solid #1a1a2e"
                            : "none",
                        outlineOffset: 2,
                        borderRadius: "50%",
                        display: "block",
                        width: 28,
                        height: 28,
                      }}
                    />
                  </div>
                ))}
              </div>
              {colorError && (
                <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>
                  Lütfen bir renk seçin.
                </p>
              )}
            </div>
          )}

          {/* SIZES */}
          <div className="values">
            <div className="values-label">
              <span>
                Beden
                {selectedSize && (
                  <strong style={{ marginLeft: 8, color: "#1a1a2e" }}>
                    — {selectedSize}
                  </strong>
                )}
              </span>
            </div>
            <div
              className="values-list"
              style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
            >
              {ALL_SIZES.map((size) => {
                const sizeData = singleProduct.sizes?.find(
                  (s) => s.size === size,
                );
                const available = !!sizeData;
                const outOfStock = available && sizeData!.stock <= 0;
                const lowStock =
                  available && sizeData!.stock > 0 && sizeData!.stock <= 3;
                const isSelected = selectedSize === size;

                return (
                  <div
                    key={size}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <span
                      onClick={() => handleSizeSelect(size)}
                      style={{
                        display: "inline-block",
                        flex: "none",
                        textDecoration:
                          !available || outOfStock ? "line-through" : "none",
                        opacity: !available || outOfStock ? 0.35 : 1,
                        cursor:
                          !available || outOfStock ? "not-allowed" : "pointer",
                        border: isSelected
                          ? "2px solid #1a1a2e"
                          : "1px solid #ddd",
                        borderRadius: 4,
                        padding: "4px 12px",
                        fontWeight: isSelected ? 700 : 400,
                        background: isSelected ? "#1a1a2e" : "transparent",
                        color: isSelected ? "#fff" : "inherit",
                        transition: "all 0.15s",
                        userSelect: "none",
                        fontSize: 13,
                      }}
                    >
                      {size}
                    </span>
                    {lowStock && (
                      <span className="size-badge">{sizeData!.stock}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {sizeError && (
              <p style={{ color: "#e74c3c", fontSize: 13, marginTop: 6 }}>
                Lütfen bir beden seçin.
              </p>
            )}
          </div>

          {/* CART */}
          <div className="cart-button">
            <input
              type="number"
              defaultValue={1}
              min={1}
              id="quantity"
              ref={quantityRef}
            />
            <button
              type="button"
              className="btn btn-lg btn-primary"
              disabled={
                !!selectedSize && selectedStock !== null && selectedStock <= 0
              }
              onClick={handleAddToCart}
            >
              {selectedSize && selectedStock !== null && selectedStock <= 0
                ? "Stokta Yok"
                : added
                  ? "Sepete Eklendi ✓"
                  : "Sepete Ekle"}
            </button>
          </div>

          {/* EXTRA */}
          <div className="product-extra-buttons">
            <a href="#">
              <i className="bi bi-globe" />
              <span>Size Guide</span>
            </a>
            <a href="#">
              <i className="bi bi-heart" />
              <span>Add to Wishlist</span>
            </a>
            <a href="#">
              <i className="bi bi-share" />
              <span>Share</span>
            </a>
          </div>
        </div>
      </form>

      {/* META */}
      <div className="divider" />
      <div className="product-meta">
        <div className="product-sku">
          <span>SKU:</span>
          <strong>BE45VGRT</strong>
        </div>
        <div className="product-categories">
          <span>Categories:</span>
          <strong>Pants, Women</strong>
        </div>
        <div className="product-tags">
          <span>Tags:</span>
          <a href="#">black</a>, <a href="#">white</a>
        </div>
      </div>
    </div>
  );
}

export default Info;
