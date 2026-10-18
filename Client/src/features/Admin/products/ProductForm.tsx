import React, { useEffect, useState } from "react";
import { Alert, Button, Checkbox, ColorPicker, Form, Input, InputNumber, Select, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { LockOutlined, UploadOutlined } from "@ant-design/icons";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { formatPrice } from "../../../utils/format";

const SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL"];
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_DISCOUNT = 90;
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

interface ICategory {
  id: number;
  name: string;
}

export type ProductFormValues = {
  name: string;
  categoryId: number;
  oldPrice: number;
  discount: number;
  description?: string;
  sizes?: string[];
};

type Props = {
  mode: "create" | "update";
  initialValues?: Partial<ProductFormValues>;
  initialColors?: string[];
  initialStocks?: Record<string, number>;
  currentImages?: string[];
  submitting: boolean;
  onSubmit: (formData: FormData) => void;
};

const calculateNewPrice = (price?: number | null, discount?: number | null) => {
  if (!price || price <= 0) return 0;
  const rate = Math.min(MAX_DISCOUNT, Math.max(0, discount ?? 0));
  return Math.round(price * (100 - rate) + Number.EPSILON) / 100;
};

const ProductForm: React.FC<Props> = ({
  mode,
  initialValues,
  initialColors,
  initialStocks,
  currentImages = [],
  submitting,
  onSubmit,
}) => {
  const [form] = Form.useForm<ProductFormValues>();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const price = Form.useWatch("oldPrice", form);
  const discount = Form.useWatch("discount", form);
  const selectedSizes: string[] = Form.useWatch("sizes", form) ?? [];
  const newPrice = calculateNewPrice(price, discount);
  const remainingImageSlots = Math.max(0, MAX_IMAGES - currentImages.length);

  useEffect(() => {
    requests.Categories.list().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  useEffect(() => {
    setColors(initialColors ?? []);
  }, [initialColors]);

  useEffect(() => {
    setStocks(initialStocks ?? {});
  }, [initialStocks]);

  const handleAddColor = () => {
    const color = (selectedColor.startsWith("#") ? selectedColor : `#${selectedColor}`).toUpperCase();
    if (colors.includes(color)) {
      message.warning("Bu renk zaten eklenmiş.");
      return;
    }
    setColors((prev) => [...prev, color]);
  };

  const beforeUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      message.error(`${file.name} 5 MB'tan büyük.`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFinish = (values: ProductFormValues) => {
    if (mode === "create" && fileList.length === 0) {
      message.error("En az 1 görsel ekleyin.");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("description", (values.description ?? "").trim());
    formData.append("oldPrice", String(values.oldPrice));
    formData.append("discount", String(values.discount ?? 0));
    formData.append("categoryId", String(values.categoryId));

    const imageField = mode === "create" ? "images" : "newImages";
    fileList.forEach((file) => {
      if (file.originFileObj) formData.append(imageField, file.originFileObj);
    });

    colors.forEach((color) => formData.append("colors", color));

    (values.sizes ?? []).forEach((size) => {
      formData.append("sizes", size);
      formData.append("stocks", String(stocks[size] ?? 0));
    });

    onSubmit(formData);
  };

  const submitLabel = mode === "create" ? "Ürünü Oluştur" : "Değişiklikleri Kaydet";

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde formu inceleyebilirsiniz, ancak kaydetme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Ürün Adı"
        name="name"
        rules={[
          { required: true, whitespace: true, message: "Ürün adı zorunludur." },
          { max: 150, message: "Ürün adı en fazla 150 karakter olabilir." },
        ]}
      >
        <Input placeholder="Örn: Slim Fit Jean" maxLength={150} />
      </Form.Item>

      <Form.Item label="Kategori" name="categoryId" rules={[{ required: true, message: "Kategori seçin." }]}>
        <Select
          placeholder="Kategori seçin"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
      </Form.Item>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <Form.Item
          label="Fiyat (₺)"
          name="oldPrice"
          rules={[{ required: true, message: "Fiyat zorunludur." }]}
        >
          <InputNumber min={0.01} max={1_000_000} precision={2} style={{ width: "100%" }} placeholder="299.99" />
        </Form.Item>

        <Form.Item label="İndirim Oranı (%)" name="discount" rules={[{ required: true, message: "İndirim oranı girin." }]}>
          <InputNumber min={0} max={MAX_DISCOUNT} precision={0} style={{ width: "100%" }} />
        </Form.Item>
      </div>

      {newPrice > 0 && (
        <div style={{ marginTop: -8, marginBottom: 20, padding: "10px 14px", background: "#f6ffed", border: "1px solid #b7eb8f", borderRadius: 8 }}>
          Satış fiyatı: <b>{formatPrice(newPrice)}</b>
          {(discount ?? 0) > 0 && price ? (
            <span style={{ color: "#8c8c8c" }}> ({formatPrice(price)} yerine, %{discount} indirim)</span>
          ) : null}
        </div>
      )}

      <Form.Item
        label="Açıklama"
        name="description"
        rules={[{ max: 4000, message: "Açıklama en fazla 4000 karakter olabilir." }]}
      >
        <Input.TextArea rows={5} placeholder="Ürün açıklaması..." maxLength={4000} showCount />
      </Form.Item>

      {currentImages.length > 0 && (
        <Form.Item label="Mevcut Görseller">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {currentImages.map((url, i) => (
              <img
                key={url}
                src={`${baseUrl}/img/${url}`}
                alt={`Görsel ${i + 1}`}
                width={96}
                height={96}
                style={{ objectFit: "cover", borderRadius: 8, border: i === 0 ? "2px solid #1677ff" : "1px solid #f0f0f0" }}
              />
            ))}
          </div>
        </Form.Item>
      )}

      <Form.Item
        label={mode === "create" ? "Görseller (ilk görsel ana görsel olur)" : "Yeni Görsel Ekle"}
        extra={`En fazla ${MAX_IMAGES} görsel, her biri en fazla 5 MB (jpg, png, webp, gif).`}
      >
        <Upload
          fileList={fileList}
          onChange={({ fileList: next }) => setFileList(next)}
          beforeUpload={beforeUpload}
          multiple
          accept={IMAGE_ACCEPT}
          listType="picture"
          maxCount={remainingImageSlots}
          disabled={remainingImageSlots === 0}
        >
          <Button icon={<UploadOutlined />} disabled={remainingImageSlots === 0}>
            Görsel Seç
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item label="Renkler (opsiyonel)">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <ColorPicker value={selectedColor} onChange={(color) => setSelectedColor(color.toHexString())} showText />
          <Button onClick={handleAddColor}>Ekle</Button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {colors.map((color) => (
            <span
              key={color}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f5f5f5", borderRadius: 6, padding: "4px 10px" }}
            >
              <span style={{ width: 16, height: 16, borderRadius: "50%", background: color, border: "1px solid #ddd" }} />
              <span style={{ fontSize: 13 }}>{color}</span>
              <button
                type="button"
                aria-label={`${color} rengini kaldır`}
                onClick={() => setColors((prev) => prev.filter((c) => c !== color))}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#999", padding: 0 }}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </Form.Item>

      <Form.Item label="Bedenler ve Stok (opsiyonel)" name="sizes">
        <Checkbox.Group style={{ width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {SIZES.map((size) => (
              <div key={size} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Checkbox value={size} style={{ minWidth: 70 }}>
                  <b>{size}</b>
                </Checkbox>
                <InputNumber
                  min={0}
                  max={100_000}
                  precision={0}
                  value={stocks[size] ?? 0}
                  onChange={(val) => setStocks((prev) => ({ ...prev, [size]: val ?? 0 }))}
                  disabled={!selectedSizes.includes(size)}
                  addonAfter="adet"
                  style={{ width: 130 }}
                />
              </div>
            ))}
          </div>
        </Checkbox.Group>
      </Form.Item>

      {isDemo ? (
        <DemoLockButton type="primary" size="large">
          {submitLabel}
        </DemoLockButton>
      ) : (
        <Button type="primary" htmlType="submit" size="large" loading={submitting}>
          {submitLabel}
        </Button>
      )}
    </Form>
  );
};

export default ProductForm;