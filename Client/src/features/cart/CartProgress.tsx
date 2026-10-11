import React, { memo } from "react";
import { useAppSelector } from "../../store/store";
import { selectCartTotals } from "./cartSlice";

const CartProgress: React.FC = memo(() => {
  const { toplam, ucretsizKargoLimiti } = useAppSelector(selectCartTotals);

  if (!ucretsizKargoLimiti) return null;

  const remaining = Math.max(0, ucretsizKargoLimiti - toplam);
  const progressPercent = Math.min(100, (toplam / ucretsizKargoLimiti) * 100);

  return (
    <div className="free-progress-bar">
      {remaining === 0 ? (
        <p className="progress-bar-title">🎉 Ücretsiz kargo kazandınız!</p>
      ) : (
        <p className="progress-bar-title">
          Ücretsiz kargo için <strong>{remaining.toFixed(2)} ₺</strong> daha ekleyin!
        </p>
      )}
      <div className="progress-bar">
        <span className="progress" style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  );
});

CartProgress.displayName = "CartProgress";

export default CartProgress;