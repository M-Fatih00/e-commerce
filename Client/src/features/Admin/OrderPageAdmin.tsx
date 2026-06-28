import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Table, Tag, Spin, message, Button, Modal, Select, Card, Col, Row, Statistic, Popconfirm } from "antd";
import { EyeOutlined, StopOutlined } from "@ant-design/icons";
import axios from "axios";
import { IOrder, IOrderItem } from "../../model/IOrder";

const DURUMLAR = ["Tümü", "Beklemede", "Ödendi", "Kargoya Verildi", "Teslim Edildi", "İptal"];

const durumRenk = (durum: string) => {
  switch (durum) {
    case "Ödendi": return "green";
    case "Beklemede": return "orange";
    case "Kargoya Verildi": return "blue";
    case "Teslim Edildi": return "cyan";
    case "İptal": return "red";
    default: return "default";
  }
};

const OrderPageAdmin: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [durumFilter, setDurumFilter] = useState("Tümü");
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<IOrder[]>("order/all");
      setOrders(data);
    } catch {
      message.error("Siparişler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const cancelOrder = async (id: number) => {
    try {
      await axios.delete(`order/${id}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, durum: "İptal" } : o))
      );
      if (selectedOrder?.id === id) {
        setSelectedOrder((prev) => prev ? { ...prev, durum: "İptal" } : null);
      }
      message.success("Sipariş iptal edildi.");
    } catch {
      message.error("İptal işlemi başarısız.");
    }
  };

  // ── İstatistikler ──
  const istatistikler = useMemo(() => ({
    toplam: orders.length,
    beklemede: orders.filter((o) => o.durum === "Beklemede").length,
    odendi: orders.filter((o) => o.durum === "Ödendi").length,
    iptal: orders.filter((o) => o.durum === "İptal").length,
  }), [orders]);

  // ── Filtrelenmiş siparişler ──
  const filteredOrders = useMemo(() => {
    if (durumFilter === "Tümü") return orders;
    return orders.filter((o) => o.durum === durumFilter);
  }, [orders, durumFilter]);

  const columns = [
    {
      title: "Sipariş #",
      dataIndex: "id",
      key: "id",
      render: (id: number) => <b>#{id}</b>,
    },
    {
      title: "Müşteri",
      dataIndex: "adSoyad",
      key: "adSoyad",
    },
    {
      title: "Şehir",
      dataIndex: "sehir",
      key: "sehir",
    },
    {
      title: "Toplam",
      dataIndex: "toplam",
      key: "toplam",
      render: (toplam: number) => <b>{toplam.toFixed(2)} ₺</b>,
    },
    {
      title: "Durum",
      dataIndex: "durum",
      key: "durum",
      render: (durum: string) => (
        <Tag color={durumRenk(durum)}>{durum}</Tag>
      ),
    },
    {
      title: "Tarih",
      dataIndex: "siparisTarihi",
      key: "siparisTarihi",
      render: (tarih: string) =>
        new Date(tarih).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IOrder) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedOrder(record);
              setModalOpen(true);
            }}
          >
            Detay
          </Button>
          <Popconfirm
            title="Siparişi iptal et"
            description="Bu siparişi iptal etmek istediğinize emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => cancelOrder(record.id)}
            disabled={record.durum === "İptal"}
          >
            <Button
              icon={<StopOutlined />}
              size="small"
              danger
              disabled={record.durum === "İptal"}
            >
              İptal
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const itemColumns = [
    {
      title: "Görsel",
      dataIndex: "urunResmi",
      key: "urunResmi",
      render: (url: string) => (
        <img
          src={`${baseUrl}/img/${url}`}
          alt=""
          width={50}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Ürün",
      dataIndex: "urunAdi",
      key: "urunAdi",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Fiyat",
      dataIndex: "fiyat",
      key: "fiyat",
      render: (fiyat: number) => `${fiyat.toFixed(2)} ₺`,
    },
    {
      title: "Miktar",
      dataIndex: "miktar",
      key: "miktar",
    },
    {
      title: "Toplam",
      key: "toplam",
      render: (_: unknown, record: IOrderItem) =>
        `${(record.fiyat * record.miktar).toFixed(2)} ₺`,
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Siparişler</h2>

      {/* ── İstatistik Kartları ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Toplam Sipariş" value={istatistikler.toplam} suffix="adet" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Beklemede"
              value={istatistikler.beklemede}
              suffix="adet"
              valueStyle={{ color: "#e67e22" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Ödendi"
              value={istatistikler.odendi}
              suffix="adet"
              valueStyle={{ color: "#2ecc71" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="İptal"
              value={istatistikler.iptal}
              suffix="adet"
              valueStyle={{ color: "#e74c3c" }}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Filtreleme ── */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ color: "#555", fontWeight: 500 }}>Duruma göre filtrele:</span>
        <Select
          value={durumFilter}
          onChange={setDurumFilter}
          style={{ width: 180 }}
        >
          {DURUMLAR.map((d) => (
            <Select.Option key={d} value={d}>{d}</Select.Option>
          ))}
        </Select>
        <span style={{ color: "#999", fontSize: 13 }}>
          {filteredOrders.length} sipariş gösteriliyor
        </span>
      </div>

      {/* ── Tablo ── */}
      <Spin spinning={loading}>
        <Table
          dataSource={filteredOrders}
          columns={columns}
          rowKey={(record) => record.id}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Spin>

      {/* ── Sipariş Detay Modal ── */}
      <Modal
        title={`Sipariş #${selectedOrder?.id} Detayı`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Popconfirm
              title="Siparişi iptal et"
              description="Bu siparişi iptal etmek istediğinize emin misiniz?"
              okText="Evet"
              cancelText="Hayır"
              onConfirm={() => selectedOrder && cancelOrder(selectedOrder.id)}
              disabled={selectedOrder?.durum === "İptal"}
            >
              <Button
                danger
                disabled={selectedOrder?.durum === "İptal"}
                icon={<StopOutlined />}
              >
                Siparişi İptal Et
              </Button>
            </Popconfirm>
            <Button onClick={() => setModalOpen(false)}>Kapat</Button>
          </div>
        }
        width={700}
      >
        {selectedOrder && (
          <div>
            <div style={{ marginBottom: 16, padding: 16, background: "#f7f8fa", borderRadius: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div><span style={{ color: "#999" }}>Ad Soyad:</span> <b>{selectedOrder.adSoyad}</b></div>
                <div><span style={{ color: "#999" }}>Telefon:</span> <b>{selectedOrder.telefon}</b></div>
                <div><span style={{ color: "#999" }}>Şehir:</span> <b>{selectedOrder.sehir}</b></div>
                <div><span style={{ color: "#999" }}>Posta Kodu:</span> <b>{selectedOrder.postaKodu}</b></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <span style={{ color: "#999" }}>Adres:</span> <b>{selectedOrder.adresSatiri}</b>
                </div>
                {selectedOrder.siparisNotu && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <span style={{ color: "#999" }}>Not:</span> <b>{selectedOrder.siparisNotu}</b>
                  </div>
                )}
              </div>
            </div>

            <Table
              dataSource={selectedOrder.orderItems}
              columns={itemColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <div style={{ color: "#999" }}>Ara Toplam: <b>{selectedOrder.araToplam.toFixed(2)} ₺</b></div>
              {selectedOrder.kuponIndirimi > 0 && (
                <div style={{ color: "#e74c3c" }}>
                  Kupon ({selectedOrder.kuponKodu}): <b>-{selectedOrder.kuponIndirimi.toFixed(2)} ₺</b>
                </div>
              )}
              <div style={{ color: "#999" }}>
                Teslimat: <b>{selectedOrder.teslimatUcreti === 0 ? "Ücretsiz" : `${selectedOrder.teslimatUcreti.toFixed(2)} ₺`}</b>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 8 }}>
                Toplam: {selectedOrder.toplam.toFixed(2)} ₺
              </div>
              <Tag color={durumRenk(selectedOrder.durum)} style={{ marginTop: 8 }}>
                {selectedOrder.durum}
              </Tag>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderPageAdmin;