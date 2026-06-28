import React, { useEffect } from "react";
import { Button, Form, Input, InputNumber, message, Space, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { couponSelectors, fetchCouponById, updateCoupon } from "./couponSlice";

const UpdateCoupon: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const loading = useAppSelector((state) => state.coupon.loading);
  const coupon = useAppSelector((state) => couponSelectors.selectById(state, Number(id)));
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCouponById(Number(id)));
  }, [dispatch, id]);

  // Kupon store'a gelince form'u doldur
  useEffect(() => {
    if (coupon) {
      form.setFieldsValue({
        code: coupon.code,
        discountPercent: coupon.discountPercent,
      });
    }
  }, [coupon, form]);

  const onFinish = async (values: { code: string; discountPercent: number }) => {
    const result = await dispatch(updateCoupon({ id: Number(id), data: values }));
    if (updateCoupon.fulfilled.match(result)) {
      message.success("Kupon güncellendi.");
      navigate("/admin/coupons");
    } else {
      message.error((result.payload as any) || "Güncelleme başarısız.");
    }
  };

  return (
    <Spin spinning={loading}>
      <h2>Kuponu Güncelle</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400 }}>
        <Form.Item
          label="Kupon Kodu"
          name="code"
          rules={[{ required: true, message: "Kupon kodu zorunlu!" }]}
        >
          <Input style={{ textTransform: "uppercase" }} />
        </Form.Item>

        <Form.Item
          label="İndirim Oranı (%)"
          name="discountPercent"
          rules={[{ required: true, message: "İndirim oranı zorunlu!" }]}
        >
          <InputNumber min={1} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit">Güncelle</Button>
          <Button onClick={() => navigate("/admin/coupons")}>İptal</Button>
        </Space>
      </Form>
    </Spin>
  );
};

export default UpdateCoupon;