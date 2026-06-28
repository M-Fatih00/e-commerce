import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const UpdateCategory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`categories/${id}`);
        form.setFieldsValue({ name: data.name });
        setCurrentImage(data.imageUrl ?? null);
      } catch {
        message.error("Kategori bilgileri getirilemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, form]);

  const onFinish = async (values: { name: string; image?: any }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);

      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await axios.put(`categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Kategori başarıyla güncellendi.");
      navigate("/admin/categories");
    } catch {
      message.error("Kategori güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Kategori Güncelle</h2>
        <Button onClick={() => navigate("/admin/categories")}>← Geri</Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Kategori Adı"
            name="name"
            rules={[{ required: true, message: "Kategori adı zorunlu!" }]}
          >
            <Input placeholder="Örn: Elektronik" />
          </Form.Item>

          {currentImage && (
            <Form.Item label="Mevcut Görsel">
              <img
                src={`${baseUrl}/img/${currentImage}`}
                alt="mevcut"
                width={120}
                style={{ borderRadius: 6, objectFit: "cover" }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Yeni Görsel (opsiyonel)"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Görsel Seç</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Güncelle
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default UpdateCategory;