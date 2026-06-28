import React from "react";
import { Button, Result } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";

const OrderFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        <Result
          status="error"
          title="Ödeme Başarısız"
          subTitle={`Sipariş #${orderId} için ödeme alınamadı. Lütfen tekrar deneyin.`}
          extra={[
            <Button type="primary" key="retry" onClick={() => navigate("/checkout")}>
              Tekrar Dene
            </Button>,
            <Button key="cart" onClick={() => navigate("/cart")}>
              Sepete Dön
            </Button>,
          ]}
        />
      </div>
    </section>
  );
};

export default OrderFailed;