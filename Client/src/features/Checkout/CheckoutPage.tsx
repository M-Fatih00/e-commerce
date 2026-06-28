import React from "react";
import { Button, Form, Input, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { createOrder } from "../Orders/orderSlice";
import { ICreateOrder } from "../../model/IOrder";
import { selectAllCartItems, selectCartTotals } from "../cart/cartSlice";
import {
  UCRETSIZ_KARGO_LIMITI,
  HIZLI_KARGO_UCRETI,
  STANDART_KARGO,
} from "../../utils/kargoSabitleri";
import "./Checkout.css";

const { TextArea } = Input;

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const cartItems = useAppSelector(selectAllCartItems);
  const {
    araToplam,
    toplam,
    kuponIndirimi,
    yeniToplam,
    couponCode,
    hizliKargo,
  } = useAppSelector(selectCartTotals);
  const loading = useAppSelector((state) => state.order.loading);
  const baseUrl = import.meta.env.VITE_BASE_URL;


  if (cartItems.length === 0) {
    navigate("/cart");
    return null;
  }

  const isStandardFree = toplam >= UCRETSIZ_KARGO_LIMITI;
  const teslimatUcreti = hizliKargo
    ? HIZLI_KARGO_UCRETI
    : isStandardFree
      ? 0
      : STANDART_KARGO;
  const cargoBase = yeniToplam ?? toplam;
  const genelToplam = (cargoBase + teslimatUcreti).toFixed(2);

  const onFinish = async (values: any) => {
    const data: ICreateOrder = {
      adSoyad: values.adSoyad,
      telefon: values.telefon,
      sehir: values.sehir,
      adresSatiri: values.adresSatiri,
      postakodu: values.postakodu,
      siparisNotu: values.siparisNotu ?? "",
      hizliKargo: hizliKargo,
      kuponKodu: couponCode ?? undefined,
    };

    const result = await dispatch(createOrder(data));

    if (!createOrder.fulfilled.match(result)) {
      const err = result.payload as any;
      message.error(err?.title || "Sipariş oluşturulamadı.");
    }
  };

  return (
    <section className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Sipariş Tamamla</h1>
        <Spin spinning={loading}>
          <div className="checkout-wrapper">
            {/* ── Teslimat Formu ── */}
            <div className="checkout-form">
              <h2>Teslimat Bilgileri</h2>
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                  label="Ad Soyad"
                  name="adSoyad"
                  rules={[{ required: true, message: "Ad Soyad zorunlu!" }]}
                >
                  <Input placeholder="Ahmet Yılmaz" />
                </Form.Item>

                <Form.Item
                  label="Telefon"
                  name="telefon"
                  rules={[{ required: true, message: "Telefon zorunlu!" }]}
                >
                  <Input placeholder="05xx xxx xx xx" />
                </Form.Item>

                <Form.Item
                  label="Şehir"
                  name="sehir"
                  rules={[{ required: true, message: "Şehir zorunlu!" }]}
                >
                  <Input placeholder="İstanbul" />
                </Form.Item>

                <Form.Item
                  label="Adres"
                  name="adresSatiri"
                  rules={[{ required: true, message: "Adres zorunlu!" }]}
                >
                  <TextArea
                    rows={3}
                    placeholder="Mahalle, cadde, sokak, no..."
                  />
                </Form.Item>

                <Form.Item
                  label="Posta Kodu"
                  name="postakodu"
                  rules={[{ required: true, message: "Posta kodu zorunlu!" }]}
                >
                  <Input placeholder="34000" />
                </Form.Item>

                <Form.Item label="Sipariş Notu" name="siparisNotu">
                  <TextArea rows={2} placeholder="İsteğe bağlı not..." />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  className="checkout-submit-btn"
                  loading={loading}
                >
                  Ödemeye Geç
                </Button>
              </Form>
            </div>

            {/* ── Sipariş Özeti ── */}
            <div className="checkout-summary">
              <h2>Sipariş Özeti</h2>

              <div className="checkout-items">
                {cartItems.map((item) => {
                  const fiyat =
                    item.indirim > 0
                      ? item.fiyat - (item.fiyat * item.indirim) / 100
                      : item.fiyat;
                  return (
                    <div className="checkout-item" key={item.cartItemId}>
                      <img
                        src={`${baseUrl}/img/${item.urunResim}`}
                        alt={item.urunAdi}
                      />
                      <div className="checkout-item-info">
                        <span className="checkout-item-name">
                          {item.urunAdi}
                        </span>
                        <span className="checkout-item-qty">
                          x{item.miktar}
                        </span>
                      </div>
                      <span className="checkout-item-price">
                        {(fiyat * item.miktar).toFixed(2)} ₺
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-totals">
                <div className="checkout-total-row">
                  <span>Ara Toplam</span>
                  <span>{araToplam.toFixed(2)} ₺</span>
                </div>

                {araToplam - toplam > 0 && (
                  <div className="checkout-total-row discount">
                    <span>Ürün İndirimi</span>
                    <span>-{(araToplam - toplam).toFixed(2)} ₺</span>
                  </div>
                )}

                {kuponIndirimi > 0 && (
                  <div className="checkout-total-row discount">
                    <span>Kupon ({couponCode})</span>
                    <span>-{kuponIndirimi.toFixed(2)} ₺</span>
                  </div>
                )}

                <div className="checkout-total-row">
                  <span>Teslimat</span>
                  <span>
                    {hizliKargo
                      ? `${HIZLI_KARGO_UCRETI} ₺ (Hızlı Kargo)`
                      : isStandardFree
                        ? "Ücretsiz"
                        : `${STANDART_KARGO} ₺`}
                  </span>
                </div>

                <div className="checkout-total-row total">
                  <span>Toplam</span>
                  <span>{genelToplam} ₺</span>
                </div>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </section>
  );
};

export default CheckoutPage;
