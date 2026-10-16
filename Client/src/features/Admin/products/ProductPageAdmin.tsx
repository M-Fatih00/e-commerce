import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Popconfirm, Space, Table, Tag, message } from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";
import { formatPrice } from "../../../utils/format";
import { IProductItem } from "../../../model/IProduct";

const ProductPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<IProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await requests.Catalog.list());
    } catch (error) {
      showFormError(error, "Ürünler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const deleteProduct = async (id: number) => {
    setDeletingId(id);
    try {
      await requests.Catalog.delete(id);
      message.success("Ürün silindi.");
      setDataSource((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      showFormError(error, "Ürün silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      title: "Görsel",
      dataIndex: "mainImage",
      key: "mainImage",
      width: 90,
      render: (url: string) =>
        url ? (
          <img src={`${baseUrl}/img/${url}`} alt="" width={64} height={64} style={{ objectFit: "cover", borderRadius: 8 }} />
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
      key: "price",
      render: (_: unknown, record: IProductItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{formatPrice(record.newPrice)}</div>
          {record.oldPrice > record.newPrice && (
            <div style={{ color: "#999", fontSize: 12, textDecoration: "line-through" }}>{formatPrice(record.oldPrice)}</div>
          )}
        </div>
      ),
    },
    {
      title: "İndirim",
      dataIndex: "discount",
      key: "discount",
      render: (discount: number) => (discount > 0 ? <Tag color="green">%{discount}</Tag> : <Tag>Yok</Tag>),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IProductItem) => (
        <Space wrap>
          <Button onClick={() => navigate(`/admin/products/update/${record.id}`)}>
            {isDemo ? "İncele" : "Güncelle"}
          </Button>
          {isDemo ? (
            <DemoLockButton danger>Sil</DemoLockButton>
          ) : (
            <Popconfirm
              title="Ürünü sil"
              description="Bu ürün kalıcı olarak silinecek."
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteProduct(record.id)}
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
        <h2 style={{ margin: 0 }}>Ürünler</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/products/create")}>
          Yeni Ürün
        </Button>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Demo sürümünde ürün formlarını inceleyebilirsiniz; ekleme, güncelleme ve silme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 700 }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
    </div>
  );
};

export default ProductPageAdmin;