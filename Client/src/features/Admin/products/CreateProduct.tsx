import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  ColorPicker,
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

interface ICategory {
  id: number;
  name: string;
}

const SIZES = ["XXS","XS", "S", "M", "L", "XL", "XXL"];

const CreateProduct: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get<ICategory[]>("categories");
        setCategories(data);
      } catch {
        message.error("Kategoriler getirilemedi.");
      }
    };
    fetchCategories();
  }, []);

  const handleAddColor = () => {
    const color = selectedColor.startsWith("#")
      ? selectedColor
      : `#${selectedColor}`;
    if (colors.includes(color)) {
      message.warning("Bu renk zaten eklenmiş.");
      return;
    }
    setColors((prev) => [...prev, color]);
  };

  const handleRemoveColor = (color: string) => {
    setColors((prev) => prev.filter((c) => c !== color));
  };

  const onFinish = async (values: any) => {
    if (colors.length === 0) {
      message.error("En az 1 renk ekleyin.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description ?? "");
      formData.append("oldPrice", values.oldPrice.toString());
      formData.append("newPrice", values.newPrice.toString());
      formData.append("discount", values.discount.toString());
      formData.append("categoryId", values.categoryId.toString());

      values.images?.forEach((file: any) => {
        formData.append("images", file.originFileObj);
      });

      colors.forEach((color) => formData.append("colors", color));
      values.sizes?.forEach((size: string) => formData.append("sizes", size));

      await axios.post("products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Ürün başarıyla oluşturuldu.");
      form.resetFields();
      setColors([]);
      navigate("/admin/products");
    } catch (error: any) {
      const backendMsg = error?.response?.data;
      message.error(
        typeof backendMsg === "string"
          ? backendMsg
          : backendMsg?.message || "Ürün oluşturulurken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 700 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h2 style={{ margin: 0 }}>Yeni Ürün</h2>
        <Button onClick={() => navigate("/admin/products")}>← Geri</Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Ürün Adı"
            name="name"
            rules={[{ required: true, message: "Ürün adı zorunlu!" }]}
          >
            <Input placeholder="Örn: Slim Fit Jean" />
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

          <Form.Item
            label="Eski Fiyat (₺)"
            name="oldPrice"
            rules={[{ required: true, message: "Eski fiyat zorunlu!" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="299.99"
            />
          </Form.Item>

          <Form.Item
            label="Yeni Fiyat (₺)"
            name="newPrice"
            rules={[{ required: true, message: "Yeni fiyat zorunlu!" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="199.99"
            />
          </Form.Item>

          <Form.Item label="İndirim Oranı (%)" name="discount" initialValue={0}>
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Açıklama" name="description">
            <Input.TextArea rows={4} placeholder="Ürün açıklaması..." />
          </Form.Item>

          <Form.Item
            label="Görseller (ilk görsel ana görsel olur)"
            name="images"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: "En az 1 görsel zorunlu!" }]}
          >
            <Upload
              beforeUpload={() => false}
              multiple
              accept="image/*"
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Görsel Seç</Button>
            </Upload>
          </Form.Item>

          {/* Renkler */}
          <Form.Item label="Renkler">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <ColorPicker
                value={selectedColor}
                onChange={(color) => {
                  const hex = color.toHexString();
                  setSelectedColor(hex);
                }}
                showText
              />
              <Button type="default" onClick={handleAddColor}>
                Ekle
              </Button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {colors.map((color) => (
                <div
                  key={color}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#f5f5f5",
                    borderRadius: 6,
                    padding: "4px 10px",
                  }}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: color,
                      border: "1px solid #ddd",
                    }}
                  />
                  <span style={{ fontSize: 13 }}>{color}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(color)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#999",
                      fontSize: 14,
                      padding: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </Form.Item>

          {/* Bedenler */}
          <Form.Item
            label="Bedenler"
            name="sizes"
            rules={[{ required: true, message: "En az 1 beden seçin!" }]}
          >
            <Checkbox.Group>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {SIZES.map((size) => (
                  <Checkbox key={size} value={size}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 12px",
                        border: "1px solid #d9d9d9",
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      {size}
                    </span>
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Oluştur
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default CreateProduct;
