import React, { useEffect } from "react";
import { Button, Result } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../store/store";
import { clearCurrentOrder } from "./orderSlice";
import { resetCartState } from "../cart/cartSlice";


const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");

  if (orderId && sessionId) {
    fetch(`${import.meta.env.VITE_API_BASE_URL}order/callback?orderId=${orderId}&session_id=${sessionId}`, {
      method: "POST",
      credentials: "include",
    }).then(() => {
      dispatch(resetCartState());
      dispatch(clearCurrentOrder());
    });
  }
}, []);

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        <Result
          status="success"
          title="Siparişiniz Alındı!"
          subTitle="Sipariş başarıyla oluşturuldu. Kargoya verildiğinde bildirim alacaksınız."
          extra={[
            <Button type="primary" key="home" onClick={() => navigate("/")}>
              Alışverişe Devam Et
            </Button>,
          ]}
        />
      </div>
    </section>
  );
};

export default OrderSuccess;