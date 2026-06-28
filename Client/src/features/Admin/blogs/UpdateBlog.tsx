import React, { useEffect, useState } from "react";
import { Button, Form, Input, message, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import RichTextEditor from "./RichTextEditor";


interface IBlogDetail {
  id: number;
  title: string;
  img: string;
  description: string;
}

const UpdateBlog: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get<IBlogDetail>(`blogs/${id}`);
        form.setFieldsValue({ title: data.title });
        setDescription(data.description ?? "");
        setCurrentImage(data.img ?? null);
      } catch {
        message.error("Blog bilgileri getirilemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, form]);

  const onFinish = async (values: { title: string; image?: any }) => {
    if (!description || description === "<p></p>") {
      message.error("Blog içeriği zorunlu!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id!);
      if (values.title) formData.append("title", values.title);
      formData.append("description", description);
      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await axios.put("blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Blog başarıyla güncellendi.");
      navigate("/admin/blogs");
    } catch {
      message.error("Blog güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Blog Güncelle</h2>
        <Button onClick={() => navigate("/admin/blogs")}>← Geri</Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Blog Başlığı"
            name="title"
            rules={[{ required: true, message: "Blog başlığı zorunlu!" }]}
          >
            <Input placeholder="Blog başlığı..." />
          </Form.Item>

          {currentImage && (
            <Form.Item label="Mevcut Görsel">
              <img
                src={`${baseUrl}/img/${currentImage}`}
                alt="mevcut"
                width={160}
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

          <Form.Item label="Blog İçeriği">
            <RichTextEditor
              value={description}
              onChange={setDescription}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Güncelle
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default UpdateBlog;