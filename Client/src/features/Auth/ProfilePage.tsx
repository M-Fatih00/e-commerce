import { formatOrderNumber, formatPrice } from "../../utils/format";
import Loader from "../../components/Loader";
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert, Button, Form, Input, message, Upload, Collapse } from "antd";
import type { UploadProps } from "antd";
import {
  UploadOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
} from "@ant-design/icons";
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

type TabKey = "account" | "orders";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "account", label: "Hesap Bilgileri", icon: "bi-person" },
  { key: "orders", label: "Siparişlerim", icon: "bi-bag" },
];

const ProfilePage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { orders, loading: ordersLoading } = useAppSelector(
    (state) => state.order,
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab: TabKey =
    searchParams.get("tab") === "orders" ? "orders" : "account";

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

  const changeTab = (key: TabKey) => {
    setSearchParams(key === "orders" ? { tab: "orders" } : {}, {
      replace: true,
    });
  };

  const paidOrders = orders.filter(
    (order: IOrder) => order.odemeAlindi && order.durum !== "İptal",
  );
  const totalSpent = paidOrders.reduce(
    (sum: number, order: IOrder) => sum + order.toplam,
    0,
  );

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

  const avatarLabel = user.avatar ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle";

  const accountTab = (
    <div className="profile-card">
      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde profil düzenleme ve fotoğraf yükleme kapalı."
          style={{ marginBottom: 20 }}
        />
      )}

      <div className="profile-section-header">
        <div>
          <h2>Hesap Bilgileri</h2>
          <p>
            Ad, kullanıcı adı ve e-posta bilgilerini buradan güncelleyebilirsin.
          </p>
        </div>
        {!editing && (
          <DemoLockButton
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            Düzenle
          </DemoLockButton>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleProfileUpdate}
        className="profile-form"
      >
        <Form.Item
          label="Ad Soyad"
          name="fullName"
          rules={
            editing
              ? [
                  {
                    required: true,
                    whitespace: true,
                    message: "Ad soyad zorunludur.",
                  },
                  {
                    max: 100,
                    message: "Ad soyad en fazla 100 karakter olabilir.",
                  },
                ]
              : []
          }
        >
          <Input disabled={!editing} maxLength={100} size="large" />
        </Form.Item>

        <div className="profile-form-grid">
          <Form.Item
            label="Kullanıcı Adı"
            name="userName"
            rules={
              editing
                ? [
                    {
                      required: true,
                      whitespace: true,
                      message: "Kullanıcı adı zorunludur.",
                    },
                    {
                      min: 3,
                      message: "Kullanıcı adı en az 3 karakter olmalıdır.",
                    },
                    {
                      max: 50,
                      message: "Kullanıcı adı en fazla 50 karakter olabilir.",
                    },
                  ]
                : []
            }
          >
            <Input disabled={!editing} maxLength={50} size="large" />
          </Form.Item>

          <Form.Item
            label="E-posta"
            name="email"
            rules={
              editing
                ? [
                    {
                      required: true,
                      whitespace: true,
                      message: "E-posta zorunludur.",
                    },
                    {
                      type: "email",
                      message: "Geçerli bir e-posta adresi girin.",
                    },
                  ]
                : []
            }
          >
            <Input disabled={!editing} maxLength={256} size="large" />
          </Form.Item>
        </div>

        {editing && (
          <div className="profile-form-actions">
            <Button
              type="primary"
              htmlType="submit"
              loading={profileLoading}
              icon={<SaveOutlined />}
            >
              Kaydet
            </Button>
            <Button icon={<CloseOutlined />} onClick={handleCancel}>
              İptal
            </Button>
          </div>
        )}
      </Form>
    </div>
  );

  const orderItems = orders.map((order: IOrder) => {
    const itemCount = order.orderItems.reduce(
      (sum, item) => sum + item.miktar,
      0,
    );

    return {
      key: order.id,
      label: (
        <div className="profile-order-header">
          <div className="profile-order-top">
            <span className="profile-order-id">
              Sipariş No:{" "}
              <strong>{formatOrderNumber(order.orderNumber)}</strong>
            </span>
            <OrderStatusTag
              durum={order.durum}
              odemeAlindi={order.odemeAlindi}
            />
          </div>
          <div className="profile-order-meta">
            <span>
              {new Date(order.siparisTarihi).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span aria-hidden="true">·</span>
            <span>{itemCount} ürün</span>
            <span aria-hidden="true">·</span>
            <span className="profile-order-meta-total">
              {formatPrice(order.toplam)}
            </span>
          </div>
        </div>
      ),
      children: (
        <>
          <ul className="profile-order-items">
            {order.orderItems.map((item) => (
              <li className="profile-order-item" key={item.id}>
                <span className="profile-order-item-name">
                  {item.urunAdi}
                  {(item.beden || item.renk) && (
                    <small>
                      {item.beden && `Beden: ${item.beden}`}
                      {item.beden && item.renk && " · "}
                      {item.renk && (
                        <>
                          Renk{" "}
                          <span
                            className="order-color-dot"
                            style={{ background: item.renk }}
                            title={item.renk}
                          />
                        </>
                      )}
                    </small>
                  )}
                </span>
                <span className="profile-order-item-qty">× {item.miktar}</span>
                <span className="profile-order-item-price">
                  {formatPrice(item.fiyat * item.miktar)}
                </span>
              </li>
            ))}
          </ul>

          <div className="profile-order-footer">
            <span>Toplam</span>
            <strong>{formatPrice(order.toplam)}</strong>
          </div>
        </>
      ),
    };
  });

  const ordersTab = ordersLoading ? (
    <div className="profile-orders-loading">
      <Loader minHeight={200} />
    </div>
  ) : orders.length === 0 ? (
    <div className="profile-orders-empty">
      <i className="bi bi-bag" aria-hidden="true" />
      <h3>Henüz siparişin yok</h3>
      <p>Beğendiğin ürünleri sepete ekleyerek ilk siparişini verebilirsin.</p>
      <Link to="/shop" className="profile-empty-link">
        Alışverişe Başla
      </Link>
    </div>
  ) : (
    <div
      className={`profile-order-scroll ${orders.length > 4 ? "has-more" : ""}`}
    >
      <Collapse
        accordion
        className="profile-order-collapse"
        items={orderItems}
      />
    </div>
  );

  return (
    <section className="profile-section">
      <div className="container">
        <div className="profile-wrapper">
          <div className="profile-hero">
            <div className="profile-hero-main">
              <div className="profile-avatar-wrap">
                <UserAvatar
                  fullName={user.fullName}
                  avatar={user.avatar}
                  size={80}
                  fontSize={28}
                />
              </div>
              <div className="profile-hero-text">
                <h1 className="profile-name">{user.fullName}</h1>
                <p className="profile-email">{user.email}</p>
                {isDemo ? (
                  <DemoLockButton size="small">{avatarLabel}</DemoLockButton>
                ) : (
                  <Upload
                    customRequest={handleAvatarUpload}
                    showUploadList={false}
                    accept={AVATAR_ACCEPT}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={avatarLoading}
                      size="small"
                    >
                      {avatarLabel}
                    </Button>
                  </Upload>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="profile-stat">
                <span>Sipariş</span>
                <strong>{ordersLoading ? "–" : orders.length}</strong>
              </div>
              <div className="profile-stat">
                <span>Toplam harcama</span>
                <strong>{ordersLoading ? "–" : formatPrice(totalSpent)}</strong>
              </div>
            </div>
          </div>

          <div
            className="profile-tabs"
            role="tablist"
            aria-label="Profil bölümleri"
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                id={`profile-tab-${tab.key}`}
                aria-selected={activeTab === tab.key}
                aria-controls="profile-panel"
                className={`profile-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => changeTab(tab.key)}
              >
                <i className={`bi ${tab.icon}`} aria-hidden="true" />
                <span>{tab.label}</span>
                {tab.key === "orders" && orders.length > 0 && (
                  <span className="profile-tab-count">{orders.length}</span>
                )}
              </button>
            ))}
          </div>

          <div
            key={activeTab}
            id="profile-panel"
            role="tabpanel"
            aria-labelledby={`profile-tab-${activeTab}`}
            className="profile-panel"
          >
            {activeTab === "account" ? accountTab : ordersTab}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;
