import { formatOrderNumber } from "../../utils/format";
import React, { useEffect, useRef } from "react";
import { Button, Result } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import requests from "../../api/requests";

const OrderFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const started = useRef(false);

  useEffect(() => {
    if (started.current || !orderNumber) return;
    started.current = true;
    requests.Order.abandon(orderNumber).catch(() => undefined);
  }, [orderNumber]);

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        <Result
          status="error"
          title="Ödeme Tamamlanmadı"
          subTitle={
            orderNumber
              ? `${formatOrderNumber(orderNumber)} numaralı sipariş için ödeme alınamadı. Sepetiniz duruyor, tekrar deneyebilirsiniz.`
              : "Ödeme alınamadı. Sepetiniz duruyor, tekrar deneyebilirsiniz."
          }
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