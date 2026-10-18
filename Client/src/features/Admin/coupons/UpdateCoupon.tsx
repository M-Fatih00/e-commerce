import Loader from "../../../components/Loader";
import React, { useEffect } from "react";
import { Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { couponSelectors, fetchCouponById, updateCoupon, CouponInput } from "./couponSlice";
import CouponForm from "./CouponForm";

const UpdateCoupon: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const couponId = Number(id);
  const saving = useAppSelector((state) => state.coupon.saving);
  const coupon = useAppSelector((state) => couponSelectors.selectById(state, couponId));

  useEffect(() => {
    if (couponId) dispatch(fetchCouponById(couponId));
  }, [dispatch, couponId]);

  const handleSubmit = async (values: CouponInput) => {
    const result = await dispatch(updateCoupon({ id: couponId, data: values }));

    if (updateCoupon.fulfilled.match(result)) {
      message.success("Kupon güncellendi.");
      navigate("/admin/coupons");
      return;
    }

    if (result.payload?.status === 400) message.error(result.payload.message);
  };

  return (
    <div style={{ maxWidth: 440 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Kuponu Güncelle</h2>
        <Button onClick={() => navigate("/admin/coupons")}>← Geri</Button>
      </div>

      {coupon ? (
        <CouponForm
          key={coupon.id}
          mode="update"
          initialValues={{ code: coupon.code, discountPercent: coupon.discountPercent }}
          submitting={saving}
          onSubmit={handleSubmit}
        />
      ) : (
        <div style={{ display: "grid", placeItems: "center", minHeight: 200 }}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default UpdateCoupon;