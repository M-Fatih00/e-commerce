import React, { useEffect, useState } from "react";
import { Button, Card, Form, Input, message, Upload, Divider, Tabs, Spin, Tag, Collapse } from "antd";
import { UploadOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateAvatar, updateProfile } from "../../features/Auth/authSlice";
import { getMyOrders } from "../Orders/orderSlice";
import { IOrder } from "../../model/IOrder";
import UserAvatar from "./UserAvatar";
import axios from "axios";
import "./ProfilePage.css";

const statusColor = (durum: string) => {
  switch (durum) {
    case "Ödendi": return "green";
    case "Kargoda": return "blue";
    case "Teslim Edildi": return "cyan";
    case "Ödeme Başarısız": return "red";
    default: return "orange";
  }
};

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName,
        userName: user.userName ?? "",
        email: user.email,
      });
    }
  }, [user, form]);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  if (!user) return null;

  const handleAvatarUpload = async (options: any) => {
    const { file } = options;
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const { data } = await axios.put("account/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      dispatch(updateAvatar(data.avatar));
      message.success("Avatar güncellendi!");
    } catch (error: any) {
      const backendMsg = error?.response?.data;
      message.error(
        typeof backendMsg === "string"
          ? backendMsg
          : backendMsg?.message || "Avatar güncellenirken hata oluştu."
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileUpdate = async (values: any) => {
    setProfileLoading(true);
    try {
      const { data } = await axios.put("account/update", {
        fullName: values.fullName,
        userName: values.userName,
        email: values.email,
      });
      dispatch(updateProfile(data));
      message.success("Profil güncellendi!");
      setEditing(false);
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Güncelleme başarısız.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      fullName: user.fullName,
      userName: user.userName ?? "",
      email: user.email,
    });
    setEditing(false);
  };

  /* ── Sekme 1: Hesap Bilgileri ── */
  const accountTab = (
    <Card>
      {/* Avatar */}
      <div className="profile-avatar-row">
        <UserAvatar fullName={user.fullName} avatar={user.avatar} size={88} fontSize={32} />
        <div>
          <h3 className="profile-name">{user.fullName}</h3>
          <p className="profile-email">{user.email}</p>
          <Upload customRequest={handleAvatarUpload} showUploadList={false} accept="image/*">
            <Button icon={<UploadOutlined />} loading={avatarLoading} size="small">
              {user.avatar ? "Avatarı Değiştir" : "Avatar Yükle"}
            </Button>
          </Upload>
        </div>
      </div>

      <Divider />

      {/* Hesap Bilgileri */}
      <div className="profile-section-header">
        <h4>Hesap Bilgileri</h4>
        {!editing && (
          <Button icon={<EditOutlined />} size="small" onClick={() => setEditing(true)}>
            Düzenle
          </Button>
        )}
      </div>

      <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
        <Form.Item label="Ad Soyad" name="fullName" rules={editing ? [{ required: true, message: "Ad soyad zorunlu!" }] : []}>
          <Input disabled={!editing} />
        </Form.Item>

        <Form.Item label="Kullanıcı Adı" name="userName" rules={editing ? [{ required: true, message: "Kullanıcı adı zorunlu!" }] : []}>
          <Input disabled={!editing} />
        </Form.Item>

        <Form.Item
          label="E-posta"
          name="email"
          rules={editing ? [
            { required: true, message: "E-posta zorunlu!" },
            { type: "email", message: "Geçerli bir e-posta girin!" },
          ] : []}
        >
          <Input disabled={!editing} />
        </Form.Item>

        {editing && (
          <div className="profile-form-actions">
            <Button type="primary" htmlType="submit" loading={profileLoading} icon={<SaveOutlined />}>
              Kaydet
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>İptal</Button>
          </div>
        )}
      </Form>
    </Card>
  );

  /* ── Sekme 2: Siparişlerim ── */
  const orderItems = orders.map((order: IOrder) => ({
    key: order.id,
    label: (
      <div className="profile-order-header">
        <div className="profile-order-info">
          <span className="profile-order-id">Sipariş #{order.id}</span>
          <span className="profile-order-date">
            {new Date(order.siparisTarihi).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <Tag color={statusColor(order.durum)}>{order.durum}</Tag>
      </div>
    ),
    children: (
      <>
        <div className="profile-order-items">
          {order.orderItems.map((item) => (
            <div className="profile-order-item" key={item.id}>
              <span className="profile-order-item-name">{item.urunAdi}</span>
              <span className="profile-order-item-qty">x{item.miktar}</span>
              <span className="profile-order-item-price">
                {(item.fiyat * item.miktar).toFixed(2)} ₺
              </span>
            </div>
          ))}
        </div>

        <div className="profile-order-footer">
          <span className="profile-order-total">
            Toplam: <strong>{order.toplam.toFixed(2)} ₺</strong>
          </span>
        </div>
      </>
    ),
  }));

  const ordersTab = (
    <Card>
      {ordersLoading ? (
        <div className="profile-orders-loading">
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
        <div className="profile-orders-empty">
          <p>Henüz siparişiniz bulunmuyor.</p>
        </div>
      ) : (
        <div className="profile-order-scroll">
          <Collapse accordion className="profile-order-collapse" items={orderItems} />
        </div>
      )}
    </Card>
  );

  return (
    <section className="profile-section">
      <div className="container">
        <div className="profile-wrapper">
          <h2 className="profile-title">Profilim</h2>

          <Tabs
            defaultActiveKey="account"
            items={[
              { key: "account", label: "Hesap Bilgileri", children: accountTab },
              { key: "orders", label: "Siparişlerim", children: ordersTab },
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;