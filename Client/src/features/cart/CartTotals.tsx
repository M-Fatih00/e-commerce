import React, { memo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { resetCoupon, selectCartTotals, setHizliKargo } from "./cartSlice";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { UCRETSIZ_KARGO_LIMITI, HIZLI_KARGO_UCRETI } from "../../utils/kargoSabitleri";



const CartTotals: React.FC = memo(() => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    araToplam,
    toplam,
    kuponIndirimi,
    yeniToplam,
    couponCode,
    couponDiscount,
    hizliKargo,
  } = useAppSelector(selectCartTotals);

  const indirimTutari = araToplam - toplam;
  const isStandardFree = toplam >= UCRETSIZ_KARGO_LIMITI;

  // Kupon uygulanmışsa yeniToplam, yoksa toplam
  const cargoBase = yeniToplam ?? toplam;
  const genelToplam = hizliKargo ? cargoBase + HIZLI_KARGO_UCRETI : cargoBase;

  const handleRemoveCoupon = () => {
    dispatch(resetCoupon());
    message.info("Kupon kaldırıldı.");
  };

  return (
    <div className="cart-totals">
      <h2>Sepet Özeti</h2>
      <table>
        <tbody>
          {/* Ara toplam */}
          <tr className="cart-subtotal">
            <th>Ara Toplam</th>
            <td>
              <span>{araToplam.toFixed(2)} ₺</span>
            </td>
          </tr>

          {/* Ürün indirimi */}
          {indirimTutari > 0 && (
            <tr className="cart-discount">
              <th>Ürün İndirimi</th>
              <td>
                <span className="discount-amount">
                  -{indirimTutari.toFixed(2)} ₺
                </span>
              </td>
            </tr>
          )}

          {/* Kupon indirimi */}
          {couponCode && (
            <tr className="cart-discount">
              <th>
                <span className="coupon-applied-label">
                  <span>{couponCode}</span>
                  <span className="coupon-discount-badge">%{couponDiscount}</span>
                  <button
                    className="coupon-remove-btn"
                    onClick={handleRemoveCoupon}
                    title="Kuponu kaldır"
                  >
                    ✕
                  </button>
                </span>
              </th>
              <td>
                <span className="discount-amount">
                  -{kuponIndirimi.toFixed(2)} ₺
                </span>
              </td>
            </tr>
          )}

          {/* Standart Kargo */}
          <tr className="cargo-row">
            <th>Standart Kargo</th>
            <td>
              {isStandardFree ? (
                <span className="cargo-badge cargo-free">✓ Ücretsiz</span>
              ) : (
                <span className="cargo-badge cargo-locked">
                  {UCRETSIZ_KARGO_LIMITI} ₺ üzeri ücretsiz
                </span>
              )}
            </td>
          </tr>

          {/* Hızlı Kargo — Redux state ile */}
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
                  checked={hizliKargo}
                  onChange={() => dispatch(setHizliKargo(!hizliKargo))}
                />
                <span className="cargo-fast-info">
                  <span className="cargo-fast-desc">1-2 iş günü teslimat</span>
                  <span className="cargo-fast-price">+{HIZLI_KARGO_UCRETI} ₺</span>
                </span>
              </label>
            </td>
          </tr>

          {/* Genel toplam */}
          <tr className="cart-total-row">
            <th>Toplam</th>
            <td>
              <strong>{genelToplam.toFixed(2)} ₺</strong>
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