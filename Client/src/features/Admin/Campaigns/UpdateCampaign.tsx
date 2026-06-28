import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, message, Select, Spin, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ICategory } from "../../../model/ICategory";
import { ICampaign } from "../../../model/ICampaign";
import { getImageUrl } from "../../../utils/image";

const UpdateCampaign: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, campRes] = await Promise.all([
          axios.get<ICategory[]>("categories"),
          axios.get<ICampaign>(`campaign/${id}`),
        ]);
        setCategories(catRes.data);
        const c = campRes.data;
        setCurrentImage(c.imageUrl);
        form.setFieldsValue({
          title: c.title,
          description: c.description,
          categoryId: c.categoryId,
          index: c.index,
        });
      } catch {
        message.error("Kampanya bilgileri getirilemedi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("id", id!);
      formData.append("title", values.title);
      formData.append("description", values.description ?? "");
      formData.append("categoryId", values.categoryId.toString());
      formData.append("index", values.index.toString());
      if (values.resim?.[0]?.originFileObj) {
        formData.append("resim", values.resim[0].originFileObj);
      }

      await axios.put(`campaign/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Kampanya başarıyla güncellendi.");
      navigate("/admin/campaigns");
    } catch {
      message.error("Kampanya güncellenirken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Kampanya Güncelle</h2>
        <Button onClick={() => navigate("/admin/campaigns")}>← Geri</Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Başlık" name="title" rules={[{ required: true, message: "Başlık zorunlu!" }]}>
            <Input placeholder="Kampanya başlığı..." />
          </Form.Item>

          <Form.Item label="Açıklama" name="description">
            <Input.TextArea rows={3} placeholder="Kampanya açıklaması..." />
          </Form.Item>

          <Form.Item label="Kategori" name="categoryId" rules={[{ required: true, message: "Kategori seçin!" }]}>
            <Select placeholder="Kategori seçin">
              {categories.map((cat) => (
                <Select.Option value={cat.id} key={cat.id}>{cat.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Sıra" name="index">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          {currentImage && (
            <Form.Item label="Mevcut Görsel">
              <img
                src={getImageUrl(currentImage)}
                alt="mevcut"
                width={160}
                style={{ borderRadius: 6, objectFit: "cover" }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Yeni Görsel (opsiyonel)"
            name="resim"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          >
            <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
              <Button icon={<UploadOutlined />}>Görsel Seç</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>Güncelle</Button>
        </Form>
      </Spin>
    </div>
  );
};

export default UpdateCampaign;