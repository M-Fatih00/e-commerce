import React from "react";
import { Button, Form, Input, InputNumber, message, Space, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { createCoupon } from "./couponSlice";

const CreateCoupon: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loading = useAppSelector((state) => state.coupon.loading);
  const [form] = Form.useForm();

  const onFinish = async (values: { code: string; discountPercent: number }) => {
    const result = await dispatch(createCoupon(values));
    if (createCoupon.fulfilled.match(result)) {
      message.success("Kupon başarıyla oluşturuldu.");
      navigate("/admin/coupons");
    } else {
      message.error((result.payload as any) || "Kupon oluşturulamadı.");
    }
  };

  return (
    <Spin spinning={loading}>
      <h2>Yeni Kupon Oluştur</h2>
      <Form form={form} layout="vertical" onFinish={onFinish} style={{ maxWidth: 400 }}>
        <Form.Item
          label="Kupon Kodu"
          name="code"
          rules={[{ required: true, message: "Kupon kodu zorunlu!" }]}
        >
          <Input placeholder="YAZA20" style={{ textTransform: "uppercase" }} />
        </Form.Item>

        <Form.Item
          label="İndirim Oranı (%)"
          name="discountPercent"
          rules={[{ required: true, message: "İndirim oranı zorunlu!" }]}
        >
          <InputNumber min={1} max={100} style={{ width: "100%" }} />
        </Form.Item>

        <Space>
          <Button type="primary" htmlType="submit">Oluştur</Button>
          <Button onClick={() => navigate("/admin/coupons")}>İptal</Button>
        </Space>
      </Form>
    </Spin>
  );
};

export default CreateCoupon;