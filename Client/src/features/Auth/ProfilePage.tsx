import { formatOrderNumber } from "../../utils/format";
import Loader from "../../components/Loader";
import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, Input, message, Upload, Divider, Tabs, Collapse } from "antd";
import type { UploadProps } from "antd";
import { UploadOutlined, EditOutlined, SaveOutlined, CloseOutlined, LockOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { updateAvatar, updateProfile } from "./authSlice";
import { getMyOrders } from "../Orders/orderSlice";
import { IOrder } from "../../model/IOrder";
import requests from "../../api/requests";
import DemoLockButton from "../../components/DemoLockButton";
import { isDemo } from "../../utils/demo";
import { showFormError } from "../../utils/errors";
import UserAvatar from "./UserAvatar";
import "./ProfilePage.css";
import { OrderStatusTag } from "../../utils/orderStatus";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

type ProfileForm = {
  fullName: string;
  userName: string;
  email: string;
};



const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading } = useAppSelector((state) => state.order);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm<ProfileForm>();

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

  const handleAvatarUpload: UploadProps["customRequest"] = async ({ file }) => {
    if (!(file instanceof File)) return;

    if (file.size > MAX_AVATAR_SIZE) {
      message.error("Dosya boyutu 5 MB'tan büyük olamaz.");
      return;
    }

    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const data = await requests.Auth.updateAvatar(formData);
      dispatch(updateAvatar(data.avatar));
      message.success("Profil fotoğrafı güncellendi.");
    } catch (error) {
      showFormError(error, "Profil fotoğrafı güncellenemedi.");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleProfileUpdate = async (values: ProfileForm) => {
    setProfileLoading(true);
    try {
      const data = await requests.Auth.updateProfile({
        fullName: values.fullName.trim(),
        userName: values.userName.trim(),
        email: values.email.trim(),
      });
      dispatch(updateProfile(data));
      message.success("Profil güncellendi.");
      setEditing(false);
    } catch (error) {
      showFormError(error, "Profil güncellenemedi.");
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

  const avatarLabel = user.avatar ? "Avatarı Değiştir" : "Avatar Yükle";

  const accountTab = (
    <Card>
      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde profil düzenleme ve fotoğraf yükleme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="profile-avatar-row">
        <UserAvatar fullName={user.fullName} avatar={user.avatar} size={88} fontSize={32} />
        <div>
          <h3 className="profile-name">{user.fullName}</h3>
          <p className="profile-email">{user.email}</p>
          {isDemo ? (
            <DemoLockButton size="small">{avatarLabel}</DemoLockButton>
          ) : (
            <Upload customRequest={handleAvatarUpload} showUploadList={false} accept={AVATAR_ACCEPT}>
              <Button icon={<UploadOutlined />} loading={avatarLoading} size="small">
                {avatarLabel}
              </Button>
            </Upload>
          )}
        </div>
      </div>

      <Divider />

      <div className="profile-section-header">
        <h4>Hesap Bilgileri</h4>
        {!editing && (
          <DemoLockButton icon={<EditOutlined />} size="small" onClick={() => setEditing(true)}>
            Düzenle
          </DemoLockButton>
        )}
      </div>

      <Form form={form} layout="vertical" onFinish={handleProfileUpdate}>
        <Form.Item
          label="Ad Soyad"
          name="fullName"
          rules={editing ? [
            { required: true, whitespace: true, message: "Ad soyad zorunludur." },
            { max: 100, message: "Ad soyad en fazla 100 karakter olabilir." },
          ] : []}
        >
          <Input disabled={!editing} maxLength={100} />
        </Form.Item>

        <Form.Item
          label="Kullanıcı Adı"
          name="userName"
          rules={editing ? [
            { required: true, whitespace: true, message: "Kullanıcı adı zorunludur." },
            { min: 3, message: "Kullanıcı adı en az 3 karakter olmalıdır." },
            { max: 50, message: "Kullanıcı adı en fazla 50 karakter olabilir." },
          ] : []}
        >
          <Input disabled={!editing} maxLength={50} />
        </Form.Item>

        <Form.Item
          label="E-posta"
          name="email"
          rules={editing ? [
            { required: true, whitespace: true, message: "E-posta zorunludur." },
            { type: "email", message: "Geçerli bir e-posta adresi girin." },
          ] : []}
        >
          <Input disabled={!editing} maxLength={256} />
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

  const orderItems = orders.map((order: IOrder) => ({
    key: order.id,
    label: (
      <div className="profile-order-header">
        <div className="profile-order-info">
          <span className="profile-order-id">Sipariş {formatOrderNumber(order.orderNumber)}</span>
          <span className="profile-order-date">
            {new Date(order.siparisTarihi).toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
        <OrderStatusTag durum={order.durum} odemeAlindi={order.odemeAlindi} />
      </div>
    ),
    children: (
      <>
        <div className="profile-order-items">
          {order.orderItems.map((item) => (
            <div className="profile-order-item" key={item.id}>
              <span className="profile-order-item-name">
                {item.urunAdi}
                {item.beden ? ` (${item.beden})` : ""}
              </span>
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
          <Loader />
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