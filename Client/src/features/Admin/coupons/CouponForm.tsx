import React from "react";
import { Alert, Button, Form, Input, InputNumber } from "antd";
import { LockOutlined } from "@ant-design/icons";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { CouponInput } from "./couponSlice";

type Props = {
  mode: "create" | "update";
  initialValues?: CouponInput;
  submitting: boolean;
  onSubmit: (values: CouponInput) => void;
};

const CouponForm: React.FC<Props> = ({ mode, initialValues, submitting, onSubmit }) => {
  const submitLabel = mode === "create" ? "Kuponu Oluştur" : "Değişiklikleri Kaydet";

  return (
    <Form<CouponInput>
      layout="vertical"
      initialValues={initialValues}
      onFinish={(values) => onSubmit({ code: values.code.trim(), discountPercent: values.discountPercent })}
    >
      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde formu inceleyebilirsiniz, ancak kaydetme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Kupon Kodu"
        name="code"
        normalize={(value?: string) => value?.toUpperCase()}
        extra="3-30 karakter; sadece İngilizce harf ve rakam."
        rules={[
          { required: true, whitespace: true, message: "Kupon kodu zorunludur." },
          { pattern: /^[A-Z0-9]{3,30}$/, message: "Kupon kodu 3-30 karakter olmalı ve sadece İngilizce harf ile rakam içermelidir." },
        ]}
      >
        <Input placeholder="YAZA20" maxLength={30} />
      </Form.Item>

      <Form.Item
        label="İndirim Oranı (%)"
        name="discountPercent"
        rules={[{ required: true, message: "İndirim oranı zorunludur." }]}
      >
        <InputNumber min={1} max={90} precision={0} style={{ width: "100%" }} />
      </Form.Item>

      {isDemo ? (
        <DemoLockButton type="primary" size="large">
          {submitLabel}
        </DemoLockButton>
      ) : (
        <Button type="primary" htmlType="submit" size="large" loading={submitting}>
          {submitLabel}
        </Button>
      )}
    </Form>
  );
};

export default CouponForm;