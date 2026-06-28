import React, { useCallback, useEffect, useState } from "react";
import { Button, message, Popconfirm, Space, Table } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface IBlogList {
  id: number;
  title: string;
  img: string;
  createdDate: string;
}

const BlogPageAdmin: React.FC = () => {
  const [dataSource, setDataSource] = useState<IBlogList[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<IBlogList[]>("blogs");
      setDataSource(data);
    } catch {
      message.error("Bloglar getirilemedi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBlog = async (id: number) => {
    try {
      await axios.delete(`blogs/${id}`);
      message.success("Blog başarıyla silindi.");
      setDataSource((prev) => prev.filter((b) => b.id !== id));
    } catch {
      message.error("Silme işlemi başarısız.");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const columns = [
    {
      title: "Blog Görseli",
      dataIndex: "img",
      key: "img",
      render: (url: string) =>
        url ? (
          <img
            src={`${baseUrl}/img/${url}`}
            alt="blog"
            width={100}
            height={65}
            style={{ objectFit: "cover", borderRadius: 6 }}
          />
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
      title: "Oluşturma Tarihi",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date: string) =>
        new Date(date).toLocaleDateString("tr-TR", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }),
    },
    {
      title: "İşlemler",
      key: "actions",
      render: (_: unknown, record: IBlogList) => (
        <Space>
          <Button
            type="primary"
            onClick={() => navigate(`/admin/blogs/update/${record.id}`)}
          >
            Güncelle
          </Button>
          <Popconfirm
            title="Blogu sil"
            description="Bu blogu silmek istediğinize emin misiniz?"
            okText="Evet"
            cancelText="Hayır"
            onConfirm={() => deleteBlog(record.id)}
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
        <h2 style={{ margin: 0 }}>Bloglar</h2>
        <Button type="primary" onClick={() => navigate("/admin/blogs/create")}>
          + Yeni Blog
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

export default BlogPageAdmin;