import { formatOrderNumber } from "../../utils/format";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dropdown,
  Input,
  Modal,
  Popconfirm,
  Select,
  Steps,
  Table,
  Tag,
  Tooltip,
  message,
} from "antd";
import {
  CarOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  InboxOutlined,
  MoreOutlined,
  ReloadOutlined,
  RollbackOutlined,
  StopOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import requests from "../../api/requests";
import { showFormError } from "../../utils/errors";
import { getOrderStatus, OrderStatusTag } from "../../utils/orderStatus";
import { IOrder } from "../../model/IOrder";
import "./OrderPageAdmin.css";

const STATUS = {
  pending: "Beklemede",
  paid: "Ödendi",
  shipped: "Kargoda",
  delivered: "Teslim Edildi",
  cancelled: "İptal",
} as const;

type FilterKey = "all" | "paid" | "shipped" | "delivered" | "refunded" | "pending" | "abandoned";

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: "all", label: "Tüm siparişler" },
  { value: "paid", label: "Hazırlanıyor" },
  { value: "shipped", label: "Kargoda" },
  { value: "delivered", label: "Teslim edildi" },
  { value: "refunded", label: "İade edildi" },
  { value: "pending", label: "Ödeme bekleniyor" },
  { value: "abandoned", label: "Yarım kalan" },
];

const matchesFilter = (order: IOrder, filter: FilterKey) => {
  switch (filter) {
    case "paid":
      return order.durum === STATUS.paid;
    case "shipped":
      return order.durum === STATUS.shipped;
    case "delivered":
      return order.durum === STATUS.delivered;
    case "refunded":
      return order.durum === STATUS.cancelled && order.odemeAlindi;
    case "pending":
      return order.durum === STATUS.pending;
    case "abandoned":
      return order.durum === STATUS.cancelled && !order.odemeAlindi;
    default:
      return true;
  }
};

const nextStep = (order: IOrder) => {
  if (order.durum === STATUS.paid)
    return {
      status: STATUS.shipped,
      label: "Kargoya Ver",
      icon: <CarOutlined />,
      question: "Sipariş kargoya verildi olarak işaretlensin mi?",
    };
  if (order.durum === STATUS.shipped)
    return {
      status: STATUS.delivered,
      label: "Teslim Edildi",
      icon: <CheckCircleOutlined />,
      question: "Sipariş teslim edildi olarak işaretlensin mi?",
    };
  return null;
};

const canCancel = (order: IOrder) => order.durum === STATUS.paid || order.durum === STATUS.pending;

const money = (value: number) => value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(-10);
  if (digits.length !== 10) return value;
  return `0${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8)}`;
};

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");

const stepIndex = (durum: string) => (durum === STATUS.delivered ? 2 : durum === STATUS.shipped ? 1 : 0);

const OrderPageAdmin: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [modal, contextHolder] = Modal.useModal();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await requests.Order.getAll());
    } catch (error) {
      showFormError(error, "Siparişler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const changeStatus = async (order: IOrder, durum: string) => {
    setActionId(order.id);
    try {
      const updated: IOrder = await requests.Order.updateStatus(order.id, durum);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setSelectedOrder((prev) => (prev?.id === updated.id ? updated : prev));

      if (durum === STATUS.cancelled) {
        message.success(order.odemeAlindi ? "Sipariş iptal edildi, ödeme iade edildi." : "Sipariş iptal edildi.");
      } else {
        message.success(`Sipariş "${getOrderStatus(durum).label}" olarak işaretlendi.`);
      }
    } catch (error) {
      showFormError(error, "Durum güncellenemedi.");
    } finally {
      setActionId(null);
    }
  };

  const confirmCancel = (order: IOrder) => {
    const isPaid = order.durum === STATUS.paid;
    modal.confirm({
      title: isPaid ? `${formatOrderNumber(order.orderNumber)} iptal edilip iade edilsin mi?` : `${formatOrderNumber(order.orderNumber)} iptal edilsin mi?`,
      content: isPaid
        ? `${money(order.toplam)} müşteriye Stripe üzerinden iade edilir ve stok geri eklenir. Bu işlem geri alınamaz.`
        : "Müşterinin ödeme sayfası kapatılır.",
      okText: isPaid ? "İptal et ve iade et" : "İptal et",
      okButtonProps: { danger: true },
      cancelText: "Vazgeç",
      onOk: () => changeStatus(order, STATUS.cancelled),
    });
  };

  const stats = useMemo(() => {
    const active = orders.filter((o) => o.odemeAlindi && o.durum !== STATUS.cancelled);
    return {
      revenue: active.reduce((sum, o) => sum + o.toplam, 0),
      paid: orders.filter((o) => o.durum === STATUS.paid).length,
      shipped: orders.filter((o) => o.durum === STATUS.shipped).length,
      delivered: orders.filter((o) => o.durum === STATUS.delivered).length,
      refunded: orders.filter((o) => o.durum === STATUS.cancelled && o.odemeAlindi).length,
    };
  }, [orders]);

  const statCards: {
    key: FilterKey;
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    bg: string;
  }[] = [
    { key: "all", label: "Ciro", value: money(stats.revenue), icon: <WalletOutlined />, color: "#531dab", bg: "#f9f0ff" },
    { key: "paid", label: "Hazırlanıyor", value: stats.paid, icon: <InboxOutlined />, color: "#d46b08", bg: "#fff7e6" },
    { key: "shipped", label: "Kargoda", value: stats.shipped, icon: <CarOutlined />, color: "#1677ff", bg: "#e6f4ff" },
    { key: "delivered", label: "Teslim edildi", value: stats.delivered, icon: <CheckCircleOutlined />, color: "#389e0d", bg: "#f6ffed" },
    { key: "refunded", label: "İade edildi", value: stats.refunded, icon: <RollbackOutlined />, color: "#cf1322", bg: "#fff1f0" },
  ];

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("tr-TR");
    return orders.filter((o) => {
      if (!matchesFilter(o, filter)) return false;
      if (!term) return true;
      return [o.orderNumber, formatOrderNumber(o.orderNumber), o.adSoyad, o.username].some((value) =>
        value?.toLocaleLowerCase("tr-TR").includes(term),
      );
    });
  }, [orders, filter, search]);

  const renderNextStep = (order: IOrder, size: "small" | "middle") => {
    const step = nextStep(order);
    if (!step) return null;

    return (
      <Popconfirm
        title={step.question}
        okText="Evet"
        cancelText="Hayır"
        onConfirm={() => changeStatus(order, step.status)}
      >
        <Button size={size} type="primary" ghost icon={step.icon} loading={actionId === order.id}>
          {step.label}
        </Button>
      </Popconfirm>
    );
  };

  const columns = [
    {
      title: "Sipariş",
      key: "order",
      width: 150,
      render: (_: unknown, record: IOrder) => (
        <div>
          <div className="op-order-no">{formatOrderNumber(record.orderNumber)}</div>
          <div className="op-muted">{formatDate(record.siparisTarihi)}</div>
        </div>
      ),
    },
    {
      title: "Müşteri",
      key: "customer",
      render: (_: unknown, record: IOrder) => (
        <div className="op-customer">
          <span className="op-avatar">{initials(record.adSoyad)}</span>
          <div>
            <div className="op-customer-name">{record.adSoyad}</div>
            <div className="op-muted">
              @{record.username} · {record.sehir}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Tutar",
      key: "amount",
      width: 140,
      render: (_: unknown, record: IOrder) => (
        <div>
          <div className="op-amount">{money(record.toplam)}</div>
          <div className="op-muted">{record.orderItems.reduce((sum, i) => sum + i.miktar, 0)} ürün</div>
        </div>
      ),
    },
    {
      title: "Durum",
      key: "status",
      width: 170,
      render: (_: unknown, record: IOrder) => (
        <OrderStatusTag durum={record.durum} odemeAlindi={record.odemeAlindi} />
      ),
    },
    {
      title: "",
      key: "actions",
      width: 200,
      render: (_: unknown, record: IOrder) => (
        <div className="op-actions" onClick={(e) => e.stopPropagation()}>
          {renderNextStep(record, "small")}
          <Tooltip title="Detay">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setSelectedOrder(record)} />
          </Tooltip>
          {canCancel(record) && (
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  {
                    key: "cancel",
                    danger: true,
                    icon: <StopOutlined />,
                    label: record.durum === STATUS.paid ? "İptal et ve iade et" : "Siparişi iptal et",
                  },
                ],
                onClick: () => confirmCancel(record),
              }}
            >
              <Button size="small" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </div>
      ),
    },
  ];

  const selectedMeta = selectedOrder ? getOrderStatus(selectedOrder.durum, selectedOrder.odemeAlindi) : null;

  return (
    <div>
      {contextHolder}

      <div className="op-header animate-fade-in">
        <div>
          <h2>Siparişler</h2>
          <p className="op-subtitle">Siparişleri takip edin ve durumlarını güncelleyin.</p>
        </div>
        <Button icon={<ReloadOutlined />} onClick={fetchOrders} loading={loading}>
          Yenile
        </Button>
      </div>

      <div className="op-stats">
        {statCards.map((card, index) => (
          <button
            key={card.key}
            type="button"
            className={`op-stat animate-fade-in-up animate-stagger${filter === card.key ? " active" : ""}`}
            style={{ "--i": index } as React.CSSProperties}
            onClick={() => setFilter(card.key)}
          >
            <span className="op-stat-icon" style={{ color: card.color, background: card.bg }}>
              {card.icon}
            </span>
            <span>
              <div className="op-stat-value">{card.value}</div>
              <div className="op-stat-label">{card.label}</div>
            </span>
          </button>
        ))}
      </div>

      <div className="op-toolbar">
        <Select value={filter} onChange={setFilter} options={FILTERS} style={{ width: 190 }} />
        <Input.Search
          allowClear
          placeholder="Sipariş no, müşteri veya kullanıcı adı"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320, maxWidth: "100%" }}
        />
        <span className="op-count">{filteredOrders.length} sipariş</span>
      </div>

      <div key={filter} className="animate-fade-in-up">
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{ pageSize: 10, hideOnSinglePage: true }}
          scroll={{ x: 820 }}
          rowClassName={() => "op-row"}
          onRow={(record) => ({ onClick: () => setSelectedOrder(record) })}
          locale={{ emptyText: "Bu filtrede sipariş yok." }}
        />
      </div>

      <Modal
        title={selectedOrder ? `Sipariş ${formatOrderNumber(selectedOrder.orderNumber)}` : ""}
        open={selectedOrder !== null}
        onCancel={() => setSelectedOrder(null)}
        width={720}
        footer={
          selectedOrder && (
            <div className="op-modal-footer">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {renderNextStep(selectedOrder, "middle")}
                {canCancel(selectedOrder) && (
                  <Button danger icon={<StopOutlined />} onClick={() => confirmCancel(selectedOrder)}>
                    {selectedOrder.durum === STATUS.paid ? "İptal et ve iade et" : "İptal et"}
                  </Button>
                )}
              </div>
              <Button onClick={() => setSelectedOrder(null)}>Kapat</Button>
            </div>
          )
        }
      >
        {selectedOrder && selectedMeta && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Tag color={selectedMeta.color} icon={selectedMeta.icon} variant="filled">
                {selectedMeta.label}
              </Tag>
              <span className="op-muted">{formatDateTime(selectedOrder.siparisTarihi)}</span>
            </div>

            {selectedOrder.odemeAlindi && selectedOrder.durum !== STATUS.cancelled && (
              <Steps
                size="small"
                current={stepIndex(selectedOrder.durum)}
                status={selectedOrder.durum === STATUS.delivered ? "finish" : "process"}
                items={[{ title: "Hazırlanıyor" }, { title: "Kargoda" }, { title: "Teslim Edildi" }]}
              />
            )}

            {selectedOrder.durum === STATUS.pending && (
              <Alert type="warning" showIcon title="Müşterinin ödemesi bekleniyor." />
            )}

            {selectedOrder.durum === STATUS.cancelled && (
              <Alert
                type={selectedOrder.odemeAlindi ? "error" : "info"}
                showIcon
                title={
                  selectedOrder.odemeAlindi
                    ? "Sipariş iptal edildi, ödeme müşteriye iade edildi."
                    : "Müşteri ödemeyi tamamlamadı."
                }
              />
            )}

            <div className="op-info">
              <div>
                <div className="op-info-label">Ad Soyad</div>
                <div className="op-info-value">{selectedOrder.adSoyad}</div>
              </div>
              <div>
                <div className="op-info-label">Kullanıcı</div>
                <div className="op-info-value">@{selectedOrder.username}</div>
              </div>
              <div>
                <div className="op-info-label">Telefon</div>
                <div className="op-info-value">{formatPhone(selectedOrder.telefon)}</div>
              </div>
              <div>
                <div className="op-info-label">Şehir / Posta Kodu</div>
                <div className="op-info-value">
                  {selectedOrder.sehir} / {selectedOrder.postaKodu}
                </div>
              </div>
              <div className="op-info-wide">
                <div className="op-info-label">Adres</div>
                <div className="op-info-value">{selectedOrder.adresSatiri}</div>
              </div>
              {selectedOrder.siparisNotu && (
                <div className="op-info-wide">
                  <div className="op-info-label">Sipariş Notu</div>
                  <div className="op-info-value">{selectedOrder.siparisNotu}</div>
                </div>
              )}
            </div>

            <div className="op-items">
              {selectedOrder.orderItems.map((item) => (
                <div className="op-item" key={item.id}>
                  {item.urunResmi ? <img src={`${baseUrl}/img/${item.urunResmi}`} alt="" /> : null}
                  <div className="op-item-info">
                    <div className="op-item-name">{item.urunAdi}</div>
                    <div className="op-muted">
                      {item.beden ? `Beden: ${item.beden} · ` : ""}
                      {item.miktar} × {money(item.fiyat)}
                    </div>
                  </div>
                  <div className="op-item-total">{money(item.fiyat * item.miktar)}</div>
                </div>
              ))}
            </div>

            <div className="op-summary">
              <div className="op-summary-row">
                <span>Ara toplam</span>
                <span>{money(selectedOrder.araToplam)}</span>
              </div>
              {selectedOrder.araToplam +
                selectedOrder.teslimatUcreti -
                selectedOrder.kuponIndirimi -
                selectedOrder.toplam >
                0.009 && (
                <div className="op-summary-row op-summary-discount">
                  <span>Ürün indirimi</span>
                  <span>
                    -
                    {money(
                      selectedOrder.araToplam +
                        selectedOrder.teslimatUcreti -
                        selectedOrder.kuponIndirimi -
                        selectedOrder.toplam,
                    )}
                  </span>
                </div>
              )}
              {selectedOrder.kuponIndirimi > 0 && (
                <div className="op-summary-row op-summary-discount">
                  <span>Kupon ({selectedOrder.kuponKodu})</span>
                  <span>-{money(selectedOrder.kuponIndirimi)}</span>
                </div>
              )}
              <div className="op-summary-row">
                <span>Kargo</span>
                <span>
                  {selectedOrder.teslimatUcreti === 0 ? "Ücretsiz" : money(selectedOrder.teslimatUcreti)}
                </span>
              </div>
              <div className="op-summary-row op-summary-total">
                <span>Toplam</span>
                <span>{money(selectedOrder.toplam)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderPageAdmin;