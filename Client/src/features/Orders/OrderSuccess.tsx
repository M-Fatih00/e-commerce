import React, { useEffect, useRef, useState } from "react";
import { Button, Result, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch } from "../../store/store";
import { clearCurrentOrder } from "./orderSlice";
import { resetCartState } from "../cart/cartSlice";
import requests from "../../api/requests";
import { getErrorMessage } from "../../utils/errors";

type Status = "verifying" | "success" | "refunded" | "error";

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const orderNumber = searchParams.get("order");
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<Status>("verifying");
  const [errorMessage, setErrorMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    if (!orderNumber || !sessionId) {
      setErrorMessage("Ödeme bilgisi bulunamadı.");
      setStatus("error");
      return;
    }

    requests.Order.confirm(orderNumber, sessionId)
      .then(() => {
        dispatch(resetCartState());
        dispatch(clearCurrentOrder());
        setStatus("success");
      })
      .catch((error) => {
        if (error?.response?.status === 409) {
          setErrorMessage(getErrorMessage(error, "Ürün stokta kalmadı. Ödemeniz iade edildi."));
          setStatus("refunded");
          return;
        }

        setErrorMessage(getErrorMessage(error, "Ödemeniz doğrulanamadı."));
        setStatus("error");
      });
  }, [dispatch, orderNumber, sessionId]);

  return (
    <section style={{ padding: "60px 0" }}>
      <div className="container">
        {status === "verifying" && (
          <Result icon={<Spin size="large" />} title="Ödemeniz doğrulanıyor..." />
        )}

        {status === "success" && (
          <Result
            status="success"
            title="Siparişiniz Alındı"
            subTitle={`Sipariş numaranız: ${orderNumber}`}
            extra={[
              <Button type="primary" key="home" onClick={() => navigate("/")}>
                Alışverişe Devam Et
              </Button>,
            ]}
          />
        )}

        {status === "refunded" && (
          <Result
            status="warning"
            title="Ürün Stokta Kalmadı"
            subTitle={errorMessage}
            extra={[
              <Button type="primary" key="cart" onClick={() => navigate("/cart")}>
                Sepete Dön
              </Button>,
            ]}
          />
        )}

        {status === "error" && (
          <Result
            status="error"
            title="Ödeme Doğrulanamadı"
            subTitle={errorMessage}
            extra={[
              <Button type="primary" key="cart" onClick={() => navigate("/cart")}>
                Sepete Dön
              </Button>,
            ]}
          />
        )}
      </div>
    </section>
  );
};

export default OrderSuccess;