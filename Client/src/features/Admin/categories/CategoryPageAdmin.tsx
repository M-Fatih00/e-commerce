import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Popconfirm, Space, Table } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ICategory } from "../../../model/ICategory";

const CategoryPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<ICategory[]>("categories");
      setDataSource(data);
    } catch {
      message.error("Kategoriler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = async (id: number) => {
    try {
      await axios.delete(`categories/${id}`);
      message.success("Kategori silindi.");
      fetchCategories();
    } catch {
      message.error("Silme işlemi başarısız.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const columns = [
    {
      title: "Görsel",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url: string) =>
        url ? (
          <img
            src={`${baseUrl}/img/${url}`}
            alt="kategori"
            width={80}
            height={60}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          <span style={{ color: "#bbb" }}>Görsel yok</span>
        ),
    },
    {
      title: "Kategori Adı",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Ürün Sayısı",
      dataIndex: "productCount",
      key: "productCount",
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: ICategory) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/categories/update/${record.id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Kategoriyi sil"
            description="Bu kategoriyi silmek istediğinize emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteCategory(record.id)}
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Kategoriler</h2>
        <Button type="primary" onClick={() => navigate("/admin/categories/create")}>
          + Yeni Kategori
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

export default CategoryPageAdmin;