import React from "react";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { createCoupon, CouponInput } from "./couponSlice";
import CouponForm from "./CouponForm";

const CreateCoupon: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const saving = useAppSelector((state) => state.coupon.saving);

  const handleSubmit = async (values: CouponInput) => {
    const result = await dispatch(createCoupon(values));

    if (createCoupon.fulfilled.match(result)) {
      message.success("Kupon oluşturuldu.");
      navigate("/admin/coupons");
      return;
    }

    if (result.payload?.status === 400) message.error(result.payload.message);
  };

  return (
    <div style={{ maxWidth: 440 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Kupon</h2>
        <Button onClick={() => navigate("/admin/coupons")}>← Geri</Button>
      </div>
      <CouponForm mode="create" submitting={saving} onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateCoupon;