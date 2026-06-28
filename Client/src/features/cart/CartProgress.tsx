import React, { memo } from "react";
import { useAppSelector } from "../../store/store";
import { selectCartTotals } from "./cartSlice";

const FREE_SHIPPING_THRESHOLD = 1000; // ₺ cinsinden ücretsiz kargo limiti

// memo + memoized selector — sadece toplam değişince render alır
const CartProgress: React.FC = memo(() => {
  const { toplam } = useAppSelector(selectCartTotals);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - toplam);
  const progressPercent = Math.min(100, (toplam / FREE_SHIPPING_THRESHOLD) * 100);
  const isEligible = remaining === 0;

  return (
    <div className="free-progress-bar">
      {isEligible ? (
        <p className="progress-bar-title">
          🎉 Ücretsiz kargo kazandınız!
        </p>
      ) : (
        <p className="progress-bar-title">
          Ücretsiz kargo için{" "}
          <strong>{remaining.toFixed(2)} ₺</strong> daha ekleyin!
        </p>
      )}
      <div className="progress-bar">
        <span
          className="progress"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
});

CartProgress.displayName = "CartProgress";

export default CartProgress;