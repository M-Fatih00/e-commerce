import React, { memo } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { resetCoupon, selectCartTotals, setHizliKargo } from "./cartSlice";

const money = (value: number) => `${value.toFixed(2)} ₺`;

const CartTotals: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const totals = useAppSelector(selectCartTotals);

  const handleRemoveCoupon = () => {
    dispatch(resetCoupon());
    message.info("Kupon kaldırıldı.");
  };

  return (
    <div className="cart-totals">
      <h2>Sepet Özeti</h2>
      <table>
        <tbody>
          <tr className="cart-subtotal">
            <th>Ara Toplam</th>
            <td>
              <span>{money(totals.araToplam)}</span>
            </td>
          </tr>

          {totals.urunIndirimi > 0 && (
            <tr className="cart-discount">
              <th>Ürün İndirimi</th>
              <td>
                <span className="discount-amount">-{money(totals.urunIndirimi)}</span>
              </td>
            </tr>
          )}

          {totals.couponCode && (
            <tr className="cart-discount">
              <th>
                <span className="coupon-applied-label">
                  <span>{totals.couponCode}</span>
                  <span className="coupon-discount-badge">%{totals.couponDiscount}</span>
                  <button className="coupon-remove-btn" onClick={handleRemoveCoupon} title="Kuponu kaldır">
                    ✕
                  </button>
                </span>
              </th>
              <td>
                <span className="discount-amount">-{money(totals.kuponIndirimi)}</span>
              </td>
            </tr>
          )}

          <tr className="cargo-row">
            <th>Standart Kargo</th>
            <td>
              {totals.kargoUcreti === 0 ? (
                <span className="cargo-badge cargo-free">✓ Ücretsiz</span>
              ) : (
                <span className="cargo-standard">
                  <span className={totals.hizliKargo ? "cargo-muted" : ""}>{money(totals.kargoUcreti)}</span>
                  <span className="cargo-hint">{totals.ucretsizKargoLimiti} ₺ üzeri ücretsiz</span>
                </span>
              )}
            </td>
          </tr>

          <tr className="cargo-row">
            <th>
              <label className="cargo-label" htmlFor="fast-cargo">
                Hızlı Kargo
              </label>
            </th>
            <td>
              <label className="cargo-fast-label" htmlFor="fast-cargo">
                <input
                  id="fast-cargo"
                  type="checkbox"
                  checked={totals.hizliKargo}
                  onChange={() => dispatch(setHizliKargo(!totals.hizliKargo))}
                />
                <span className="cargo-fast-info">
                  <span className="cargo-fast-desc">1-2 iş günü teslimat</span>
                  <span className="cargo-fast-price">+{money(totals.hizliKargoUcreti)}</span>
                </span>
              </label>
            </td>
          </tr>

          <tr className="cart-total-row">
            <th>Toplam</th>
            <td>
              <strong>{money(totals.genelToplam)}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="checkout">
        <button className="btn btn-lg" onClick={() => navigate("/checkout")}>
          Ödemeye Geç
        </button>
      </div>
    </div>
  );
});

CartTotals.displayName = "CartTotals";

export default CartTotals;