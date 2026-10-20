import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Popconfirm, Space, Switch, Table, Tag, Tooltip, message } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, LockOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";
import { getImageUrl } from "../../../utils/image";
import { ISlider } from "./SliderForm";

const MAX_SLIDERS = 10;

const SliderPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<ISlider[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchSliders = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await requests.Sliders.listAdmin());
    } catch (error) {
      showFormError(error, "Slider'lar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSliders();
  }, [fetchSliders]);

  const moveSlider = async (id: number, direction: "up" | "down") => {
    setBusyId(id);
    try {
      setDataSource(await requests.Sliders.move(id, direction));
    } catch (error) {
      showFormError(error, "Sıra değiştirilemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = async (record: ISlider, aktif: boolean) => {
    setBusyId(record.id);
    try {
      const updated: ISlider = await requests.Sliders.updateStatus(record.id, aktif);
      setDataSource((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      message.success(aktif ? "Slider yayına alındı." : "Slider gizlendi.");
    } catch (error) {
      showFormError(error, "Durum değiştirilemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const deleteSlider = async (id: number) => {
    setBusyId(id);
    try {
      await requests.Sliders.delete(id);
      message.success("Slider silindi.");
      setDataSource((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      showFormError(error, "Slider silinemedi.");
    } finally {
      setBusyId(null);
    }
  };

  const maxReached = dataSource.length >= MAX_SLIDERS;
  const hasActive = dataSource.some((s) => s.aktif);

  const columns = [
    {
      title: "Sıra",
      key: "order",
      width: 110,
      render: (_: unknown, record: ISlider, index: number) => (
        <Space size={4}>
          <Tag style={{ margin: 0, minWidth: 28, textAlign: "center" }}>{index + 1}</Tag>
          <Tooltip title={isDemo ? "Demo sürümünde kapalı" : "Yukarı taşı"}>
            <Button
              size="small"
              icon={<ArrowUpOutlined />}
              aria-label="Yukarı taşı"
              disabled={isDemo || index === 0 || busyId !== null}
              onClick={() => moveSlider(record.id, "up")}
            />
          </Tooltip>
          <Tooltip title={isDemo ? "Demo sürümünde kapalı" : "Aşağı taşı"}>
            <Button
              size="small"
              icon={<ArrowDownOutlined />}
              aria-label="Aşağı taşı"
              disabled={isDemo || index === dataSource.length - 1 || busyId !== null}
              onClick={() => moveSlider(record.id, "down")}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: "Görsel",
      dataIndex: "resim",
      key: "resim",
      width: 180,
      render: (url: string, record: ISlider) => (
        <img
          src={getImageUrl(url)}
          alt=""
          width={160}
          height={72}
          style={{ objectFit: "cover", borderRadius: 8, opacity: record.aktif ? 1 : 0.45 }}
        />
      ),
    },
    {
      title: "İçerik",
      key: "content",
      render: (_: unknown, record: ISlider) =>
        record.baslik || record.altBaslik || record.butonMetni ? (
          <div>
            {record.baslik && <div style={{ color: "#999", fontSize: 12, letterSpacing: 0.5 }}>{record.baslik}</div>}
            {record.altBaslik && <b>{record.altBaslik}</b>}
            {record.butonMetni && (
              <div style={{ marginTop: 4 }}>
                <Tag color="blue" variant="filled">
                  {record.butonMetni} → {record.butonLinki}
                </Tag>
              </div>
            )}
          </div>
        ) : (
          <span style={{ color: "#bbb" }}>Yazı yok, sadece görsel</span>
        ),
    },
    {
      title: "Durum",
      key: "status",
      width: 110,
      render: (_: unknown, record: ISlider) => (
        <Tooltip title={isDemo ? "Demo sürümünde kapalı" : undefined}>
          <Switch
            checked={record.aktif}
            checkedChildren="Aktif"
            unCheckedChildren="Pasif"
            disabled={isDemo}
            loading={busyId === record.id}
            onChange={(checked) => toggleStatus(record, checked)}
          />
        </Tooltip>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      width: 200,
      render: (_: unknown, record: ISlider) => (
        <Space wrap>
          <Button onClick={() => navigate(`/admin/sliders/update/${record.id}`)}>
            {isDemo ? "İncele" : "Güncelle"}
          </Button>
          {isDemo ? (
            <DemoLockButton danger>Sil</DemoLockButton>
          ) : (
            <Popconfirm
              title="Slider'ı sil"
              description="Slider ve görseli kalıcı olarak silinecek."
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteSlider(record.id)}
            >
              <Button danger loading={busyId === record.id}>
                Sil
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Slider</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/sliders/create")}
          disabled={maxReached}
        >
          {maxReached ? `En fazla ${MAX_SLIDERS} slider` : "Yeni Slider"}
        </Button>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde slider'ları inceleyebilirsiniz; ekleme, sıralama, güncelleme ve silme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      {!loading && dataSource.length > 0 && !hasActive && (
        <Alert
          type="warning"
          showIcon
          title="Hiç aktif slider yok. Anasayfada slider bölümü görünmeyecek."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 760 }}
        pagination={false}
      />
    </div>
  );
};

export default SliderPageAdmin;