import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  message,
  Select,
  Spin,
  Upload,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ICategory } from "../../../model/ICategory";
import { ICampaign } from "../../../model/ICampaign";

const CreateCampaign: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [maxReached, setMaxReached] = useState(false);

  useEffect(() => {
    axios.get<ICampaign[]>("campaign").then(({ data }) => {
      if (data.length >= 4) setMaxReached(true);
    });
    axios
      .get<ICategory[]>("categories")
      .then(({ data }) => setCategories(data));
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description ?? "");
      formData.append("categoryId", values.categoryId.toString());
      formData.append("index", values.index.toString());
      if (values.resim?.[0]?.originFileObj) {
        formData.append("resim", values.resim[0].originFileObj);
      }

      await axios.post("campaign", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Kampanya başarıyla oluşturuldu.");
      navigate("/admin/campaigns");
    } catch {
      message.error("Kampanya oluşturulurken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>Yeni Kampanya</h2>
        <Button onClick={() => navigate("/admin/campaigns")}>← Geri</Button>
      </div>

      <Spin spinning={loading}>
        {maxReached && (
          <div
            style={{
              background: "#fff3cd",
              border: "1px solid #ffc107",
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 24,
              color: "#856404",
              fontWeight: 500,
            }}
          >
            ⚠️ Maksimum 4 kampanya eklenebilir. Yeni kampanya eklemek için
            mevcut bir kampanyayı silin.
          </div>
        )}
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <fieldset
                disabled={maxReached}
                style={{ border: "none", padding: 0 }}
            >
                <Form.Item
                label="Başlık"
                name="title"
                rules={[{ required: true, message: "Başlık zorunlu!" }]}
                >
                <Input placeholder="Kampanya başlığı..." />
                </Form.Item>

                <Form.Item label="Açıklama" name="description">
                <Input.TextArea rows={3} placeholder="Kampanya açıklaması..." />
                </Form.Item>

                <Form.Item
                label="Kategori"
                name="categoryId"
                rules={[{ required: true, message: "Kategori seçin!" }]}
                >
                <Select placeholder="Kategori seçin">
                    {categories.map((cat) => (
                    <Select.Option value={cat.id} key={cat.id}>
                        {cat.name}
                    </Select.Option>
                    ))}
                </Select>
                </Form.Item>

                <Form.Item label="Sıra" name="index" initialValue={0}>
                <InputNumber min={0} style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                label="Görsel"
                name="resim"
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
            </fieldset>
        </Form>
      </Spin>
    </div>
  );
};

export default CreateCampaign;
