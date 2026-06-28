import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ICampaign } from "../../../model/ICampaign";
import { getImageUrl } from "../../../utils/image";

const CampaignPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<ICampaign[]>("campaign");
      setDataSource(data);
    } catch {
      message.error("Kampanyalar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCampaign = async (id: number) => {
    try {
      await axios.delete(`campaign/${id}`);
      message.success("Kampanya silindi.");
      setDataSource((prev) => prev.filter((c) => c.id !== id));
    } catch {
      message.error("Silme işlemi başarısız.");
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const columns = [
    {
      title: "Görsel",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string) =>
        url ? (
          <img
            src={getImageUrl(url)}
            alt="kampanya"
            width={120}
            height={70}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          <span style={{ color: "#bbb" }}>Görsel yok</span>
        ),
    },
    {
      title: "Sıra",
      dataIndex: "index",
      key: "index",
      render: (index: number) => <Tag>{index}</Tag>,
    },
    {
      title: "Başlık",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Açıklama",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <span style={{ color: "#999", fontSize: 13 }}>{text}</span>
      ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: ICampaign) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/campaigns/update/${record.id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Kampanyayı sil"
            description="Bu kampanyayı silmek istediğinize emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteCampaign(record.id)}
          >
            <Button type="primary" danger>
              Sil
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>Kampanyalar</h2>
        <Button
          type="primary"
          onClick={() => navigate("/admin/campaigns/create")}
          disabled={dataSource.length >= 4}
        >
          {dataSource.length >= 4 ? "Maksimum 4 Kampanya" : "+ Yeni Kampanya"}
        </Button>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
      />
    </div>
  );
};

export default CampaignPageAdmin;
