import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Table, Tag } from "antd";
import ReactApexChart from "react-apexcharts";
import axios from "axios";

interface AylikVeri {
  ay: string;
  siparisSayisi: number;
  gelir: number;
}

interface SonSiparis {
  id: number;
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
    const fetchDashboard = async () => {
      try {
        const { data } = await axios.get<DashboardData>("dashboard");
        setData(data);
      } catch (err) {
        console.error("Dashboard verisi alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ── Area Chart ──
  const areaOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
      zoom: { enabled: false },
    },
    stroke: { curve: "smooth", width: [2, 2] },
    markers: { size: 4, strokeWidth: 2, hover: { size: 6 } },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0.05,
        stops: [0, 100],
      },
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
        labels: {
          formatter: (val) => val.toFixed(0),
          style: { colors: "#9aa0ac" },
        },
      },
      {
        opposite: true,
        title: { text: "Gelir (₺)", style: { color: "#3498db" } },
        labels: {
          formatter: (val) => `${val.toFixed(0)}₺`,
          style: { colors: "#9aa0ac" },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (val) => `${val} adet` },
        { formatter: (val) => `${val.toFixed(2)} ₺` },
      ],
    },
    colors: ["#1a1a2e", "#3498db"],
    grid: { borderColor: "#f0f0f0", strokeDashArray: 4 },
    legend: { position: "top", horizontalAlign: "right", fontSize: "13px" },
  };

  const areaSeries = [
    {
      name: "Sipariş Sayısı",
      data: data?.aylikVeri.map((d) => d.siparisSayisi) ?? [],
    },
    {
      name: "Gelir (₺)",
      data: data?.aylikVeri.map((d) => d.gelir) ?? [],
    },
  ];

  // ── Donut Chart ──
  const donutOptions: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    labels: data?.kategoriSatislari.map((k) => k.kategori) ?? [],
    colors: ["#1a1a2e", "#3498db", "#2ecc71", "#e67e22", "#e74c3c", "#9b59b6"],
    legend: {
      position: "bottom",
      fontSize: "13px",
    },
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
              formatter: (w) =>
                w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0) + " adet",
            },
          },
        },
      },
    },
    dataLabels: { enabled: false },
    tooltip: {
      y: { formatter: (val) => `${val} adet` },
    },
    responsive: [
      {
        breakpoint: 480,
        options: { legend: { position: "bottom" } },
      },
    ],
  };

  const donutSeries = data?.kategoriSatislari.map((k) => k.adet) ?? [];

  // ── Tablo ──
  const columns = [
    {
      title: "Sipariş #",
      dataIndex: "id",
      key: "id",
      render: (id: number) => `#${id}`,
    },
    {
      title: "Müşteri",
      dataIndex: "adSoyad",
      key: "adSoyad",
    },
    {
      title: "Tutar",
      dataIndex: "toplam",
      key: "toplam",
      render: (toplam: number) => `${toplam.toFixed(2)} ₺`,
    },
    {
      title: "Durum",
      dataIndex: "durum",
      key: "durum",
      render: (durum: string) => (
        <Tag color={durum === "Ödendi" ? "green" : durum === "Beklemede" ? "orange" : "red"}>
          {durum}
        </Tag>
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
  ];

  return (
    <div>
      {/* ── Stat Kartları ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Toplam Sipariş" value={data?.toplamSiparis ?? 0} suffix="adet" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Toplam Gelir" value={data?.toplamGelir ?? 0} precision={2} suffix="₺" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Toplam Kullanıcı" value={data?.toplamKullanici ?? 0} suffix="kişi" />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic title="Toplam Ürün" value={data?.toplamUrun ?? 0} suffix="ürün" />
          </Card>
        </Col>
      </Row>

      {/* ── Grafikler ── */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {/* Area Chart */}
        <Col xs={24} lg={16}>
          <Card loading={loading} style={{ height: "100%" }}>
            <h3 style={{ marginBottom: 4, fontWeight: 600 }}>Aylık Sipariş & Gelir</h3>
            <p style={{ color: "#9aa0ac", fontSize: 13, marginBottom: 16 }}>
              Son 6 aylık performans
            </p>
            {!loading && (
              <ReactApexChart
                options={areaOptions}
                series={areaSeries}
                type="area"
                height={280}
              />
            )}
          </Card>
        </Col>

        {/* Donut Chart */}
        <Col xs={24} lg={8}>
          <Card loading={loading} style={{ height: "100%" }}>
            <h3 style={{ marginBottom: 4, fontWeight: 600 }}>Kategori Satış Dağılımı</h3>
            <p style={{ color: "#9aa0ac", fontSize: 13, marginBottom: 16 }}>
              Kategoriye göre satılan ürün adedi
            </p>
            {!loading && (
              <ReactApexChart
                options={donutOptions}
                series={donutSeries}
                type="donut"
                height={280}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Son Siparişler ── */}
      <Card style={{ marginTop: 24 }} loading={loading}>
        <h3 style={{ marginBottom: 16, fontWeight: 600 }}>Son Siparişler</h3>
        <Table
          dataSource={data?.sonSiparisler ?? []}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;