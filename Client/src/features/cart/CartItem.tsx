import React, { memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import {
  addItem,
  removeItem,
  removeItemOptimistic,
  selectItemLoading,
} from "./cartSlice";
import { ICartItem } from "../../model/ICart";
import { Link } from "react-router-dom";
import { message } from "antd";

interface CartItemProps {
  cartItem: ICartItem;
}

const CartItem: React.FC<CartItemProps> = memo(({ cartItem }) => {
  const dispatch = useAppDispatch();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const isLoading = useAppSelector(selectItemLoading(cartItem.urunId));

  const discountedPrice =
    cartItem.indirim > 0
      ? cartItem.fiyat - (cartItem.fiyat * cartItem.indirim) / 100
      : cartItem.fiyat;

  const handleAdd = async () => {
    const result = await dispatch(
      addItem({
        urunId: cartItem.urunId,
        miktar: 1,
        beden: cartItem.beden ?? undefined,
        renk: cartItem.renk ?? undefined,
      }),
    );

    if (addItem.rejected.match(result)) {
      const payload = result.payload as any;
      const backendMsg = payload?.error;
      message.error(
        backendMsg?.message || backendMsg?.title || "Ürün eklenemedi.",
      );
    }
  };

  const handleRemoveOne = () => {
    if (cartItem.miktar <= 1) return;
    dispatch(
      removeItem({
        urunId: cartItem.urunId,
        miktar: 1,
        beden: cartItem.beden,
        renk: cartItem.renk,
      }),
    );
  };

  const handleRemoveAll = () => {
    dispatch(removeItemOptimistic({ cartItemId: cartItem.cartItemId }));
    dispatch(
      removeItem({
        urunId: cartItem.urunId,
        miktar: cartItem.miktar,
        beden: cartItem.beden,
        renk: cartItem.renk,
      }),
    );
  };

  return (
    <tr className="cart-item">
      <td></td>

      {/* RESİM + SİL */}
      <td className="cart-image">
        <Link to={`/product/${cartItem.urunId}`}>
          <img
            src={`${baseUrl}/img/${cartItem.urunResim}`}
            alt={cartItem.urunAdi}
          />
        </Link>
        <i
          className="bi bi-x delete-cart"
          onClick={handleRemoveAll}
          title="Ürünü sepetten kaldır"
        />
      </td>

      {/* ÜRÜN ADI + BEDEN + RENK */}
      <td>
        <Link to={`/product/${cartItem.urunId}`}>{cartItem.urunAdi}</Link>
        <div
          style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}
        >
          {cartItem.beden && (
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                border: "1px solid #ddd",
                borderRadius: 4,
                color: "#555",
                letterSpacing: 0.5,
              }}
            >
              {cartItem.beden}
            </span>
          )}
          {cartItem.renk && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                border: "1px solid #ddd",
                borderRadius: 4,
                color: "#555",
              }}
            >
              Renk:
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: cartItem.renk,
                  border: "1px solid #ccc",
                  display: "inline-block",
                }}
              />
            </span>
          )}
        </div>
      </td>

      {/* FİYAT */}
      <td>{discountedPrice.toFixed(2)} ₺</td>

      {/* MİKTAR + / - */}
      <td className="product-quantity">
        <div className="quantity-control">
          <button
            className="qty-btn bi bi-dash"
            onClick={handleRemoveOne}
            disabled={isLoading || cartItem.miktar <= 1}
            aria-label="Azalt"
          />
          <span className="qty-value">
            {isLoading ? "..." : cartItem.miktar}
          </span>
          <button
            className="qty-btn bi bi-plus"
            onClick={handleAdd}
            disabled={isLoading}
            aria-label="Artır"
          />
        </div>
      </td>

      {/* TOPLAM */}
      <td className="product-subtotal">
        {(discountedPrice * cartItem.miktar).toFixed(2)} ₺
      </td>
    </tr>
  );
});

CartItem.displayName = "CartItem";

export default CartItem;
