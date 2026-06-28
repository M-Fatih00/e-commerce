import React, { useState } from "react";
import { message } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { applyCoupon, selectCartTotals } from "./cartSlice";

const CartCoupon: React.FC = () => {
  const [couponCode, setCouponCode] = useState<string>("");
  const { couponCode: appliedCoupon } = useAppSelector(selectCartTotals);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleApply = async () => {
    if (!couponCode.trim()) {
      message.warning("Lütfen bir kupon kodu girin.");
      return;
    }

    // Aynı kupon zaten uygulanmışsa tekrar uygulama
    if (appliedCoupon && appliedCoupon === couponCode.trim().toUpperCase()) {
      message.warning("Bu kupon zaten uygulandı.");
      return;
    }

    setLoading(true);
    const result = await dispatch(applyCoupon(couponCode.trim()));

    if (applyCoupon.fulfilled.match(result)) {
      message.success(
        `"${result.payload.code}" kodu uygulandı — %${result.payload.discountPercent} indirim kazandınız!`,
      );
      setCouponCode("");
    } else {
      const payload = result.payload as any;
      message.error(
        payload?.message ||
          payload?.title ||
          "Geçersiz veya bulunamayan kupon kodu.",
      );
    }

    setLoading(false);
  };

  return (
    <div className="actions-wrapper">
      <div className="coupon">
        <input
          type="text"
          className="input-text"
          placeholder="Kupon kodu"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
        />
        <button
          className="btn"
          type="button"
          onClick={handleApply}
          disabled={loading}
        >
          {loading ? "Uygulanıyor..." : "Kuponu Uygula"}
        </button>
      </div>
    </div>
  );
};

export default CartCoupon;
