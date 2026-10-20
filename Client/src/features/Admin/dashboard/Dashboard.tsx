import { useEffect, useState } from "react";
import { Card, Col, Empty, Row, Statistic, Table } from "antd";
import ReactApexChart from "react-apexcharts";
import requests from "../../../api/requests";
import { formatPrice, formatOrderNumber } from "../../../utils/format";
import { OrderStatusTag } from "../../../utils/orderStatus";

interface AylikVeri {
  ay: string;
  siparisSayisi: number;
  gelir: number;
}

interface SonSiparis {
  orderNumber: string;
  adSoyad: string;
  toplam: number;
  durum: string;
  siparisTarihi: string;
}

interface KategoriSatis {
  kategori: string;
  adet: number;
}

interface DashboardData {
  toplamSiparis: number;
  toplamGelir: number;
  toplamKullanici: number;
  toplamUrun: number;
  aylikVeri: AylikVeri[];
  sonSiparisler: SonSiparis[];
  kategoriSatislari: KategoriSatis[];
}


const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requests.Dashboard.get()
      .then(setData)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const hasCategorySales = (data?.kategoriSatislari.length ?? 0) > 0;

  const areaOptions: ApexCharts.ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, fontFamily: "inherit", zoom: { enabled: false } },
    stroke: { curve: "smooth", width: [2, 2] },
    markers: { size: 4, strokeWidth: 2, hover: { size: 6 } },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100] },
    },
    xaxis: {
      categories: data?.aylikVeri.map((d) => d.ay) ?? [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#9aa0ac", fontSize: "12px" } },
    },
    yaxis: [
      {
        title: { text: "Sipariş", style: { color: "#1a1a2e" } },
        labels: { formatter: (val) => val.toFixed(0), style: { colors: "#9aa0ac" } },
      },
      {
        opposite: true,
        title: { text: "Gelir (₺)", style: { color: "#3498db" } },
        labels: { formatter: (val) => `${val.toFixed(0)} ₺`, style: { colors: "#9aa0ac" } },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [{ formatter: (val) => `${val} adet` }, { formatter: (val) => formatPrice(val) }],
    },
    colors: ["#1a1a2e", "#3498db"],
    grid: { borderColor: "#f0f0f0", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "right", fontSize: "13px" },
  };

  const areaSeries = [
    { name: "Sipariş Sayısı", data: data?.aylikVeri.map((d) => d.siparisSayisi) ?? [] },
    { name: "Gelir (₺)", data: data?.aylikVeri.map((d) => d.gelir) ?? [] },
  ];

  const donutOptions: ApexCharts.ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: data?.kategoriSatislari.map((k) => k.kategori) ?? [],
    colors: ["#1a1a2e", "#3498db", "#2ecc71", "#e67e22", "#e74c3c", "#9b59b6"],
    legend: { position: "bottom", fontSize: "13px" },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Toplam",
              fontSize: "14px",
              fontWeight: 600,
              color: "#1a1a2e",
              formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) + " adet",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: (val) => `${val} adet` } },
  };

  const donutSeries = data?.kategoriSatislari.map((k) => k.adet) ?? [];

  const columns = [
    {
      title: "Sipariş No",
      dataIndex: "orderNumber",
      key: "orderNumber",
      render: (value: string) => <b>{formatOrderNumber(value)}</b>,
    },
    { title: "Müşteri", dataIndex: "adSoyad", key: "adSoyad" },
    {
      title: "Tutar",
      dataIndex: "toplam",
      key: "toplam",
      render: (toplam: number) => formatPrice(toplam),
    },
    {
      title: "Durum",
      dataIndex: "durum",
      key: "durum",
      render: (durum: string) => <OrderStatusTag durum={durum} />,
    },
    {
      title: "Tarih",
      dataIndex: "siparisTarihi",
      key: "siparisTarihi",
      render: (tarih: string) =>
        new Date(tarih).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" }),
    },
  ];

  const stats = [
    { title: "Satış", value: data?.toplamSiparis ?? 0, suffix: "sipariş" },
    { title: "Gelir", value: data?.toplamGelir ?? 0, formatter: (v: number | string) => formatPrice(Number(v)) },
    { title: "Kullanıcı", value: data?.toplamKullanici ?? 0, suffix: "kişi" },
    { title: "Ürün", value: data?.toplamUrun ?? 0, suffix: "ürün" },
  ];

  return (
    <div className="animate-fade-in">
      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={stat.title}>
            <Card
              loading={loading}
              className="animate-fade-in-up animate-stagger"
              style={{ "--i": index } as React.CSSProperties}
            >
              <Statistic
                title={stat.title}
                value={stat.value}
                suffix={stat.suffix}
                formatter={stat.formatter ? (v) => stat.formatter!(v as number) : undefined}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <p style={{ color: "#9aa0ac", fontSize: 12, margin: "8px 0 0" }}>
        Satış ve gelir, ödemesi alınmış siparişleri kapsar; iadeler hariçtir.
      </p>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card loading={loading} style={{ height: "100%" }}>
            <h3 style={{ marginBottom: 4, fontWeight: 600 }}>Aylık Sipariş ve Gelir</h3>
            <p style={{ color: "#9aa0ac", fontSize: 13, marginBottom: 16 }}>Son 6 ay</p>
            {!loading && <ReactApexChart options={areaOptions} series={areaSeries} type="area" height={280} />}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card loading={loading} style={{ height: "100%" }}>
            <h3 style={{ marginBottom: 4, fontWeight: 600 }}>Kategori Dağılımı</h3>
            <p style={{ color: "#9aa0ac", fontSize: 13, marginBottom: 16 }}>Kategoriye göre satılan ürün adedi</p>
            {!loading &&
              (hasCategorySales ? (
                <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={280} />
              ) : (
                <Empty description="Henüz satış yok" style={{ padding: "48px 0" }} />
              ))}
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 16 }} loading={loading}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Son Siparişler</h3>
        <Table
          dataSource={data?.sonSiparisler ?? []}
          columns={columns}
          rowKey="orderNumber"
          pagination={false}
          size="small"
          scroll={{ x: 560 }}
          locale={{ emptyText: "Henüz sipariş yok" }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;