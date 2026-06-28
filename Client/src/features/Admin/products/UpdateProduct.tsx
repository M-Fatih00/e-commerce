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
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { IProductDetail } from "../../../model/IProductDetail";

interface ICategory {
  id: number;
  name: string;
}

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];

const UpdateProduct: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>("#000000");
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [sizeStocks, setSizeStocks] = useState<Record<string, number>>({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, productRes] = await Promise.all([
          axios.get<ICategory[]>("categories"),
          axios.get<IProductDetail>(`products/${id}`),
        ]);

        setCategories(catRes.data);

        const p = productRes.data;
        setColors(p.colors ?? []);
        setCurrentImages(p.images ?? []);

        const stocks: Record<string, number> = {};
        p.sizes?.forEach((s) => {
          stocks[s.size] = s.stock;
        });
        setSizeStocks(stocks);

        const matchedCat = catRes.data.find((c) => c.name === p.categoryName);

        form.setFieldsValue({
          name: p.name,
          oldPrice: p.oldPrice,
          newPrice: p.newPrice,
          discount: p.discount,
          description: p.description,
          categoryId: matchedCat?.id,
          sizes: p.sizes?.map((s) => s.size) ?? [],
        });
      } catch (error: any) {
        const backendMsg = error?.response?.data;
        message.error(
          typeof backendMsg === "string"
            ? backendMsg
            : backendMsg?.message || "Ürün güncellenirken bir hata oluştu.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, form]);

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

  const handleStockChange = (size: string, stock: number | null) => {
    setSizeStocks((prev) => ({ ...prev, [size]: stock ?? 0 }));
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();

      if (values.name) formData.append("name", values.name);
      if (values.description)
        formData.append("description", values.description);
      if (values.oldPrice != null)
        formData.append("oldPrice", values.oldPrice.toString());
      if (values.newPrice != null)
        formData.append("newPrice", values.newPrice.toString());
      if (values.discount != null)
        formData.append("discount", values.discount.toString());
      if (values.categoryId != null)
        formData.append("categoryId", values.categoryId.toString());

      values.newImages?.forEach((file: any) => {
        formData.append("newImages", file.originFileObj);
      });

      colors.forEach((color) => formData.append("colors", color));

      values.sizes?.forEach((size: string) => {
        formData.append("sizes", size);
        formData.append("stocks", (sizeStocks[size] ?? 0).toString());
      });

      await axios.put(`products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      message.success("Ürün başarıyla güncellendi.");
      navigate("/admin/products");
    } catch (error: any) {
      const backendMsg = error?.response?.data;
      message.error(
        typeof backendMsg === "string"
          ? backendMsg
          : backendMsg?.message || "Ürün güncellenirken bir hata oluştu.",
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
        <h2 style={{ margin: 0 }}>Ürün Güncelle</h2>
        <Button onClick={() => navigate("/admin/products")}>← Geri</Button>
      </div>

      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Ürün Adı"
            name="name"
            rules={[{ required: true, message: "Ürün adı zorunlu!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Kategori" name="categoryId">
            <Select placeholder="Kategori seçin">
              {categories.map((cat) => (
                <Select.Option value={cat.id} key={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Eski Fiyat (₺)" name="oldPrice">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Yeni Fiyat (₺)" name="newPrice">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="İndirim Oranı (%)" name="discount">
            <InputNumber min={0} max={100} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Açıklama" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          {currentImages.length > 0 && (
            <Form.Item label="Mevcut Görseller">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {currentImages.map((url, i) => (
                  <img
                    key={i}
                    src={`${baseUrl}/img/${url}`}
                    alt={`görsel-${i}`}
                    width={100}
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />
                ))}
              </div>
            </Form.Item>
          )}

          <Form.Item
            label="Yeni Görseller Ekle (opsiyonel)"
            name="newImages"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
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
                onChange={(color) => setSelectedColor(color.toHexString())}
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

          {/* Bedenler + Stok */}
          <Form.Item label="Bedenler ve Stok" name="sizes">
            <Checkbox.Group>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {SIZES.map((size) => (
                  <div
                    key={size}
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <Checkbox value={size}>
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
                    <InputNumber
                      min={0}
                      placeholder="Stok"
                      value={sizeStocks[size] ?? 0}
                      onChange={(val) => handleStockChange(size, val)}
                      style={{ width: 100 }}
                      addonAfter="adet"
                    />
                  </div>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Güncelle
          </Button>
        </Form>
      </Spin>
    </div>
  );
};

export default UpdateProduct;
