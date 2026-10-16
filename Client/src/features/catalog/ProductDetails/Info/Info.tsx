import { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { IProductDetail } from "../../../../model/IProductDetail";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import { addItem } from "../../../cart/cartSlice";
import { formatPrice } from "../../../../utils/format";
import "./Info.css";

interface InfoProps {
  singleProduct: IProductDetail;
}

const MAX_QUANTITY = 20;

function StarRating({ rating }: { rating: number }) {
  return (
    <ul className="product-star" aria-label={`5 üzerinden ${rating.toFixed(1)} puan`}>
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
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [colorError, setColorError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const sizes = singleProduct.sizes ?? [];
  const colors = singleProduct.colors ?? [];
  const hasSizes = sizes.length > 0;
  const hasColors = colors.length > 0;
  const hasDiscount = singleProduct.oldPrice > singleProduct.newPrice;
  const averageRating = singleProduct.averageRating ?? 0;
  const reviewCount = singleProduct.reviewCount ?? 0;

  const selectedStock = hasSizes ? sizes.find((s) => s.size === selectedSize)?.stock ?? null : null;
  const allOutOfStock = hasSizes && sizes.every((s) => s.stock <= 0);
  const maxQuantity = Math.max(1, Math.min(MAX_QUANTITY, selectedStock ?? MAX_QUANTITY));

  const handleQuantityChange = (value: number) => {
    if (Number.isNaN(value)) return;
    setQuantity(Math.min(maxQuantity, Math.max(1, Math.floor(value))));
  };

  const handleSizeSelect = (size: string, stock: number) => {
    if (stock <= 0) return;
    setSelectedSize(size);
    setSizeError(false);
    setQuantity((current) => Math.min(current, Math.min(MAX_QUANTITY, stock)));
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setColorError(false);
  };

  const handleAddToCart = async () => {
    if (!user) {
      message.warning("Sepete eklemek için giriş yapmalısınız.");
      navigate("/auth");
      return;
    }

    const sizeErr = hasSizes && !selectedSize;
    const colorErr = hasColors && !selectedColor;
    setSizeError(sizeErr);
    setColorError(colorErr);
    if (sizeErr || colorErr) return;

    setAdding(true);
    const result = await dispatch(
      addItem({
        urunId: singleProduct.id,
        miktar: quantity,
        beden: selectedSize ?? undefined,
        renk: selectedColor ?? undefined,
      }),
    );
    setAdding(false);

    if (addItem.fulfilled.match(result)) {
      message.success("Ürün sepete eklendi.");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      return;
    }

    const error = (result.payload as any)?.error;
    if (error?.message) message.error(error.message);
  };

  return (
    <div className="product-info">
      <h1 className="product-title">{singleProduct.name}</h1>

      <div className="product-review">
        <StarRating rating={averageRating} />
        <span>{reviewCount > 0 ? `${reviewCount} yorum` : "Henüz yorum yok"}</span>
      </div>

      <div className="product-price">
        <strong className="new-price">{formatPrice(singleProduct.newPrice)}</strong>
        {hasDiscount && <s className="old-price">{formatPrice(singleProduct.oldPrice)}</s>}
        {singleProduct.discount > 0 && <span className="discount-badge">%{singleProduct.discount} indirim</span>}
      </div>

      {singleProduct.description && <p className="product-description">{singleProduct.description}</p>}

      <form className="variations-form" onSubmit={(e) => e.preventDefault()}>
        <div className="variations">
          {hasColors && (
            <div className="colors">
              <div className="colors-label">
                <span>Renk</span>
              </div>
              <div className="colors-wrapper">
                {colors.map((color) => (
                  <div className="color-wrapper" key={color}>
                    <button
                      type="button"
                      aria-label={`Renk ${color}`}
                      aria-pressed={selectedColor === color}
                      onClick={() => handleColorSelect(color)}
                      style={{
                        backgroundColor: color,
                        cursor: "pointer",
                        outline: selectedColor === color ? "3px solid #1a1a2e" : "none",
                        outlineOffset: 2,
                        borderRadius: "50%",
                        border: "1px solid #ddd",
                        display: "block",
                        width: 28,
                        height: 28,
                        padding: 0,
                      }}
                    />
                  </div>
                ))}
              </div>
              {colorError && <p className="field-error">Lütfen bir renk seçin.</p>}
            </div>
          )}

          {hasSizes && (
            <div className="values">
              <div className="values-label">
                <span>
                  Beden
                  {selectedSize && <strong style={{ marginLeft: 8, color: "#1a1a2e" }}>— {selectedSize}</strong>}
                </span>
              </div>
              <div className="values-list" style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {sizes.map(({ size, stock }) => {
                  const outOfStock = stock <= 0;
                  const lowStock = stock > 0 && stock <= 3;
                  const isSelected = selectedSize === size;

                  return (
                    <div key={size} style={{ position: "relative", display: "inline-block" }}>
                      <button
                        type="button"
                        onClick={() => handleSizeSelect(size, stock)}
                        disabled={outOfStock}
                        aria-pressed={isSelected}
                        title={outOfStock ? "Tükendi" : lowStock ? `Son ${stock} ürün` : undefined}
                        style={{
                          textDecoration: outOfStock ? "line-through" : "none",
                          opacity: outOfStock ? 0.35 : 1,
                          cursor: outOfStock ? "not-allowed" : "pointer",
                          border: isSelected ? "2px solid #1a1a2e" : "1px solid #ddd",
                          borderRadius: 4,
                          padding: "6px 14px",
                          fontWeight: isSelected ? 700 : 400,
                          background: isSelected ? "#1a1a2e" : "transparent",
                          color: isSelected ? "#fff" : "inherit",
                          transition: "all 0.15s",
                          fontSize: 13,
                        }}
                      >
                        {size}
                      </button>
                      {lowStock && <span className="size-badge">{stock}</span>}
                    </div>
                  );
                })}
              </div>
              {sizeError && <p className="field-error">Lütfen bir beden seçin.</p>}
            </div>
          )}

          <div className="cart-button">
            <input
              type="number"
              min={1}
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              disabled={allOutOfStock}
              aria-label="Adet"
            />
            <button
              type="button"
              className="btn btn-lg btn-primary"
              disabled={allOutOfStock || adding}
              onClick={handleAddToCart}
            >
              {allOutOfStock ? "Tükendi" : adding ? "Ekleniyor..." : added ? "Sepete Eklendi ✓" : "Sepete Ekle"}
            </button>
          </div>
        </div>
      </form>

      <div className="divider" />
      <div className="product-meta">
        <div className="product-categories">
          <span>Kategori: </span>
          <strong>{singleProduct.categoryName}</strong>
        </div>
      </div>
    </div>
  );
}

export default Info;