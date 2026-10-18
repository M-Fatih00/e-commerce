import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Popconfirm, Space, Table, Tooltip, message } from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";
import { ICategory } from "../../../model/ICategory";

const CategoryPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await requests.Categories.list());
    } catch (error) {
      showFormError(error, "Kategoriler getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const deleteCategory = async (id: number) => {
    setDeletingId(id);
    try {
      await requests.Categories.delete(id);
      message.success("Kategori silindi.");
      setDataSource((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      showFormError(error, "Kategori silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderDelete = (record: ICategory) => {
    if (isDemo) return <DemoLockButton danger>Sil</DemoLockButton>;

    if (record.productCount > 0) {
      return (
        <Tooltip title="İçinde ürün olan kategori silinemez. Önce ürünleri başka bir kategoriye taşıyın.">
          <span style={{ display: "inline-block", cursor: "not-allowed" }}>
            <Button danger disabled>
              Sil
            </Button>
          </span>
        </Tooltip>
      );
    }

    return (
      <Popconfirm
        title="Kategoriyi sil"
        description="Bu kategori kalıcı olarak silinecek."
        okText="Sil"
        cancelText="Vazgeç"
        okButtonProps={{ danger: true }}
        onConfirm={() => deleteCategory(record.id)}
      >
        <Button danger loading={deletingId === record.id}>
          Sil
        </Button>
      </Popconfirm>
    );
  };

  const columns = [
    {
      title: "Görsel",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 110,
      render: (url: string) =>
        url ? (
          <img src={`${baseUrl}/img/${url}`} alt="" width={80} height={60} style={{ objectFit: "cover", borderRadius: 8 }} />
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
        <Space wrap>
          <Button onClick={() => navigate(`/admin/categories/update/${record.id}`)}>
            {isDemo ? "İncele" : "Güncelle"}
          </Button>
          {renderDelete(record)}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ margin: 0 }}>Kategoriler</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/categories/create")}>
          Yeni Kategori
        </Button>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde kategori formlarını inceleyebilirsiniz; ekleme, güncelleme ve silme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 560 }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
    </div>
  );
};

export default CategoryPageAdmin;