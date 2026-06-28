import React, { useState } from "react";
import { Button, Form, Input, message, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CreateCategory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { name: string; image: any }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);

      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await axios.post("categories", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Kategori başarıyla oluşturuldu.");
      form.resetFields();
      navigate("/admin/categories");
    } catch {
      message.error("Kategori oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Kategori</h2>
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

          <Form.Item
            label="Kategori Görseli"
            name="image"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: "Görsel zorunlu!" }]}
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
            Oluştur
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default CreateCategory;