import React, { useState } from "react";
import { Button, Form, Input, Spin, message } from "antd";
import { Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { createOrder } from "../Orders/orderSlice";
import { ICreateOrder } from "../../model/IOrder";
import { selectAllCartItems, selectCartTotals } from "../cart/cartSlice";
import "./Checkout.css";

const { TextArea } = Input;

type CheckoutForm = {
  adSoyad: string;
  telefon: string;
  sehir: string;
  adresSatiri: string;
  postaKodu: string;
  siparisNotu?: string;
};

const money = (value: number) => `${value.toFixed(2)} ₺`;

const phoneRule = {
  validator: (_: unknown, value?: string) => {
    const digits = (value ?? "").replace(/\D/g, "");
    if (!value || (digits.length >= 10 && digits.length <= 12)) return Promise.resolve();
    return Promise.reject(new Error("Geçerli bir telefon numarası girin."));
  },
};

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [form] = Form.useForm<CheckoutForm>();
  const [redirecting, setRedirecting] = useState(false);

  const cartItems = useAppSelector(selectAllCartItems);
  const cartLoading = useAppSelector((state) => state.cart.initialLoading);
  const totals = useAppSelector(selectCartTotals);
  const loading = useAppSelector((state) => state.order.loading);
  const fullName = useAppSelector((state) => state.auth.user?.fullName);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  if (cartLoading) {
    return (
      <section className="checkout-page">
        <div className="container" style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
          <Spin size="large" />
        </div>
      </section>
    );
  }

  if (cartItems.length === 0 && !redirecting) return <Navigate to="/cart" replace />;

  const onFinish = async (values: CheckoutForm) => {
    const data: ICreateOrder = {
      adSoyad: values.adSoyad.trim(),
      telefon: values.telefon.trim(),
      sehir: values.sehir.trim(),
      adresSatiri: values.adresSatiri.trim(),
      postaKodu: values.postaKodu.trim(),
      siparisNotu: values.siparisNotu?.trim() ?? "",
      hizliKargo: totals.hizliKargo,
      kuponKodu: totals.couponCode ?? undefined,
    };

    const result = await dispatch(createOrder(data));

    if (createOrder.fulfilled.match(result)) {
      setRedirecting(true);
      return;
    }

    if (result.payload?.status === 400) message.error(result.payload.message);
  };

  const busy = loading || redirecting;

  return (
    <section className="checkout-page">
      <div className="container">
        <h1 className="checkout-title animate-fade-in">Sipariş Tamamla</h1>
        <div className="checkout-wrapper">
          <div className="checkout-form animate-fade-in-up">
            <h2>Teslimat Bilgileri</h2>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{ adSoyad: fullName ?? "" }}
              disabled={busy}
            >
              <Form.Item
                label="Ad Soyad"
                name="adSoyad"
                rules={[
                  { required: true, whitespace: true, message: "Ad soyad zorunludur." },
                  { max: 100, message: "Ad soyad en fazla 100 karakter olabilir." },
                ]}
              >
                <Input placeholder="Ahmet Yılmaz" maxLength={100} autoComplete="name" />
              </Form.Item>

              <Form.Item
                label="Telefon"
                name="telefon"
                rules={[{ required: true, whitespace: true, message: "Telefon zorunludur." }, phoneRule]}
              >
                <Input placeholder="0555 123 45 67" maxLength={20} inputMode="tel" autoComplete="tel" />
              </Form.Item>

              <Form.Item
                label="Şehir"
                name="sehir"
                rules={[
                  { required: true, whitespace: true, message: "Şehir zorunludur." },
                  { max: 50, message: "Şehir en fazla 50 karakter olabilir." },
                ]}
              >
                <Input placeholder="İstanbul" maxLength={50} autoComplete="address-level1" />
              </Form.Item>

              <Form.Item
                label="Adres"
                name="adresSatiri"
                rules={[
                  { required: true, whitespace: true, message: "Adres zorunludur." },
                  { max: 250, message: "Adres en fazla 250 karakter olabilir." },
                ]}
              >
                <TextArea
                  rows={3}
                  placeholder="Mahalle, cadde, sokak, no..."
                  maxLength={250}
                  showCount
                  autoComplete="street-address"
                />
              </Form.Item>

              <Form.Item
                label="Posta Kodu"
                name="postaKodu"
                rules={[
                  { required: true, message: "Posta kodu zorunludur." },
                  { pattern: /^\d{5}$/, message: "Posta kodu 5 haneli olmalıdır." },
                ]}
              >
                <Input placeholder="34000" maxLength={5} inputMode="numeric" autoComplete="postal-code" />
              </Form.Item>

              <Form.Item
                label="Sipariş Notu"
                name="siparisNotu"
                rules={[{ max: 500, message: "Sipariş notu en fazla 500 karakter olabilir." }]}
              >
                <TextArea rows={2} placeholder="İsteğe bağlı not..." maxLength={500} showCount />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="checkout-submit-btn"
                loading={busy}
                disabled={false}
              >
                {redirecting ? "Ödeme sayfasına yönlendiriliyor..." : "Ödemeye Geç"}
              </Button>
            </Form>
          </div>

          <div className="checkout-summary animate-fade-in-up animate-stagger" style={{ "--i": 1 } as React.CSSProperties}>
            <h2>Sipariş Özeti</h2>

            <div className="checkout-items">
              {cartItems.map((item) => (
                <div className="checkout-item" key={item.cartItemId}>
                  <img src={`${baseUrl}/img/${item.urunResim}`} alt={item.urunAdi} />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.urunAdi}</span>
                    <span className="checkout-item-qty">
                      {item.beden ? `${item.beden} · ` : ""}x{item.miktar}
                    </span>
                  </div>
                  <span className="checkout-item-price">{money(item.fiyat * item.miktar)}</span>
                </div>
              ))}
            </div>

            <div className="checkout-totals">
              <div className="checkout-total-row">
                <span>Ara Toplam</span>
                <span>{money(totals.araToplam)}</span>
              </div>

              {totals.urunIndirimi > 0 && (
                <div className="checkout-total-row discount">
                  <span>Ürün İndirimi</span>
                  <span>-{money(totals.urunIndirimi)}</span>
                </div>
              )}

              {totals.kuponIndirimi > 0 && (
                <div className="checkout-total-row discount">
                  <span>Kupon ({totals.couponCode})</span>
                  <span>-{money(totals.kuponIndirimi)}</span>
                </div>
              )}

              <div className="checkout-total-row">
                <span>Teslimat</span>
                <span>
                  {totals.hizliKargo
                    ? `${money(totals.kargo)} (Hızlı Kargo)`
                    : totals.kargo === 0
                      ? "Ücretsiz"
                      : money(totals.kargo)}
                </span>
              </div>

              <div className="checkout-total-row total">
                <span>Toplam</span>
                <span>{money(totals.genelToplam)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;