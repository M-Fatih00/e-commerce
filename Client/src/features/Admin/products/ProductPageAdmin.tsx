import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Popconfirm, Space, Table, Tag } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface IProductList {
  id: number;
  name: string;
  newPrice: number;
  discount: number;
  mainImage: string;
}

const ProductPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<IProductList[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<IProductList[]>("products");
      setDataSource(data);
    } catch {
      message.error("Ürünler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = async (id: number) => {
    try {
      await axios.delete(`products/${id}`);
      message.success("Ürün silindi.");
      setDataSource((prev) => prev.filter((p) => p.id !== id));
    } catch {
      message.error("Silme işlemi başarısız.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const columns = [
    {
      title: "Görsel",
      dataIndex: "mainImage",
      key: "mainImage",
      render: (url: string) =>
        url ? (
          <img
            src={`${baseUrl}/img/${url}`}
            alt="ürün"
            width={100}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          <span style={{ color: "#bbb" }}>Görsel yok</span>
        ),
    },
    {
      title: "Ürün Adı",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Fiyat",
      dataIndex: "newPrice",
      key: "newPrice",
      render: (price: number) => `${price.toFixed(2)} ₺`,
    },
    {
      title: "İndirim",
      dataIndex: "discount",
      key: "discount",
      render: (discount: number) =>
        discount > 0 ? (
          <Tag color="green">%{discount}</Tag>
        ) : (
          <Tag color="default">Yok</Tag>
        ),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IProductList) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/products/update/${record.id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Ürünü sil"
            description="Bu ürünü silmek istediğinize emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteProduct(record.id)}
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
        <h2 style={{ margin: 0 }}>Ürünler</h2>
        <Button type="primary" onClick={() => navigate("/admin/products/create")}>
          + Yeni Ürün
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

export default ProductPageAdmin;