import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Popconfirm, Space, Table, message } from "antd";
import { LockOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";

interface IBlogList {
  id: number;
  title: string;
  img: string;
  createdDate: string;
}

const BlogPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<IBlogList[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      setDataSource(await requests.Blogs.getAll());
    } catch (error) {
      showFormError(error, "Bloglar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const deleteBlog = async (id: number) => {
    setDeletingId(id);
    try {
      await requests.Blogs.delete(id);
      message.success("Blog silindi.");
      setDataSource((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      showFormError(error, "Blog silinemedi.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns = [
    {
      title: "Görsel",
      dataIndex: "img",
      key: "img",
      width: 130,
      render: (url: string) =>
        url ? (
          <img src={`${baseUrl}/img/${url}`} alt="" width={100} height={64} style={{ objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <span style={{ color: "#bbb" }}>Görsel yok</span>
        ),
    },
    {
      title: "Başlık",
      dataIndex: "title",
      key: "title",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Tarih",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date: string) =>
        new Date(date).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" }),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IBlogList) => (
        <Space wrap>
          <Button onClick={() => navigate(`/admin/blogs/update/${record.id}`)}>
            {isDemo ? "İncele" : "Güncelle"}
          </Button>
          {isDemo ? (
            <DemoLockButton danger>Sil</DemoLockButton>
          ) : (
            <Popconfirm
              title="Blogu sil"
              description="Bu yazı kalıcı olarak silinecek."
              okText="Sil"
              cancelText="Vazgeç"
              okButtonProps={{ danger: true }}
              onConfirm={() => deleteBlog(record.id)}
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
        <h2 style={{ margin: 0 }}>Bloglar</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/admin/blogs/create")}>
          Yeni Blog
        </Button>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde blog formlarını inceleyebilirsiniz; ekleme, güncelleme ve silme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 600 }}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
    </div>
  );
};

export default BlogPageAdmin;