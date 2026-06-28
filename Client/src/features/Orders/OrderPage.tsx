import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { getMyOrders } from "./orderSlice";
import { IOrder } from "../../model/IOrder";
import { Spin, Tag } from "antd";
import "./Order.css";

const statusColor = (durum: string) => {
  switch (durum) {
    case "Ödendi": return "green";
    case "Kargoda": return "blue";
    case "Teslim Edildi": return "cyan";
    case "Ödeme Başarısız": return "red";
    default: return "orange"; // Beklemede
  }
};

const OrderPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orders, loading } = useAppSelector((state) => state.order);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  if (loading) {
    return (
      <section className="order-page">
        <div className="container">
          <Spin size="large" />
        </div>
      </section>
    );
  }

  return (
    <section className="order-page">
      <div className="container">
        <h1 className="order-title">Siparişlerim</h1>

        {orders.length === 0 ? (
          <div className="order-empty">
            <p>Henüz siparişiniz bulunmuyor.</p>
            <button className="btn" onClick={() => navigate("/shop")}>
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="order-list">
            {orders.map((order: IOrder) => (
              <div className="order-card" key={order.id}>

                {/* Sipariş Başlık */}
                <div className="order-card-header">
                  <div className="order-card-info">
                    <span className="order-id">Sipariş #{order.id}</span>
                    <span className="order-date">
                      {new Date(order.siparisTarihi).toLocaleDateString("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <Tag color={statusColor(order.durum)}>{order.durum}</Tag>
                </div>

                {/* Ürünler */}
                <div className="order-card-items">
                  {order.orderItems.map((item) => (
                    <div className="order-card-item" key={item.id}>
                      <span className="order-item-name">{item.urunAdi}</span>
                      <span className="order-item-qty">x{item.miktar}</span>
                      <span className="order-item-price">
                        {(item.fiyat * item.miktar).toFixed(2)} ₺
                      </span>
                    </div>
                  ))}
                </div>

                {/* Sipariş Özeti */}
                <div className="order-card-footer">
                  <div className="order-card-address">
                    <span>{order.adSoyad}</span>
                    <span>{order.adresSatiri}, {order.sehir}</span>
                  </div>
                  <div className="order-card-totals">
                    {order.kuponIndirimi > 0 && (
                      <span className="order-discount">
                        Kupon: -{order.kuponIndirimi.toFixed(2)} ₺
                      </span>
                    )}
                    {order.teslimatUcreti > 0 && (
                      <span>Kargo: {order.teslimatUcreti.toFixed(2)} ₺</span>
                    )}
                    <span className="order-total">
                      Toplam: <strong>{order.toplam.toFixed(2)} ₺</strong>
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default OrderPage;