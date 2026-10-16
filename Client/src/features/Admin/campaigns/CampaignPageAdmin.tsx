import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Popconfirm, Space, Table, Tag, message } from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";
import { getImageUrl } from "../../../utils/image";
import { ICampaign } from "../../../model/ICampaign";

const MAX_CAMPAIGNS = 4;

const CampaignPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await requests.Campaigns.list());
    } catch (error) {
      showFormError(error, "Kampanyalar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const deleteCampaign = async (id: number) => {
    setDeletingId(id);
    try {
      await requests.Campaigns.delete(id);
      message.success("Kampanya silindi.");
      setDataSource((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      showFormError(error, "Kampanya silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const maxReached = dataSource.length >= MAX_CAMPAIGNS;

  const columns = [
    {
      title: "Görsel",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 150,
      render: (url: string) =>
        url ? (
          <img src={getImageUrl(url)} alt="" width={120} height={70} style={{ objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <span style={{ color: "#bbb" }}>Görsel yok</span>
        ),
    },
    {
      title: "Sıra",
      dataIndex: "index",
      key: "index",
      width: 80,
      render: (index: number) => <Tag>{index}</Tag>,
    },
    {
      title: "Başlık",
      key: "title",
      render: (_: unknown, record: ICampaign) => (
        <div>
          <b>{record.title}</b>
          {record.description && <div style={{ color: "#999", fontSize: 13 }}>{record.description}</div>}
        </div>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: ICampaign) => (
        <Space wrap>
          <Button onClick={() => navigate(`/admin/campaigns/update/${record.id}`)}>
            {isDemo ? "İncele" : "Güncelle"}
          </Button>
          {isDemo ? (
            <DemoLockButton danger>Sil</DemoLockButton>
          ) : (
            <Popconfirm
              title="Kampanyayı sil"
              description="Kampanya ana sayfadan kaldırılacak."
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteCampaign(record.id)}
            >
              <Button danger loading={deletingId === record.id}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Kampanyalar</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/admin/campaigns/create")}
          disabled={maxReached}
        >
          {maxReached ? `En fazla ${MAX_CAMPAIGNS} kampanya` : "Yeni Kampanya"}
        </Button>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Demo sürümünde kampanya formlarını inceleyebilirsiniz; ekleme, güncelleme ve silme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 640 }}
        pagination={false}
      />
    </div>
  );
};

export default CampaignPageAdmin;