import React, { useState } from "react";
import { Button, Form, Input, message, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RichTextEditor from "./RichTextEditor";


const CreateBlog: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values: { title: string; image: any }) => {
    if (!description || description === "<p></p>") {
      message.error("Blog içeriği zorunlu!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", description);
      if (values.image?.[0]?.originFileObj) {
        formData.append("image", values.image[0].originFileObj);
      }

      await axios.post("blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Blog başarıyla oluşturuldu.");
      form.resetFields();
      setDescription("");
      navigate("/admin/blogs");
    } catch {
      message.error("Blog oluşturulurken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Blog</h2>
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

          <Form.Item
            label="Görsel"
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

          <Form.Item label="Blog İçeriği">
            <RichTextEditor
              value={description}
              onChange={setDescription}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Oluştur
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default CreateBlog;