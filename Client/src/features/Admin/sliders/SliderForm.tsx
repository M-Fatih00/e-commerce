import React, { useEffect, useMemo, useState } from "react";
import { Alert, Button, Form, Input, Switch, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { LockOutlined, UploadOutlined } from "@ant-design/icons";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { getImageUrl } from "../../../utils/image";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";
const INTERNAL_LINK = /^\/(?!\/)[A-Za-z0-9\-._~/?=&%]*$/;

export interface ISlider {
  id: number;
  index: number;
  resim: string;
  aktif: boolean;
  baslik?: string | null;
  altBaslik?: string | null;
  butonMetni?: string | null;
  butonLinki?: string | null;
}

export type SliderFormValues = {
  baslik?: string;
  altBaslik?: string;
  butonMetni?: string;
  butonLinki?: string;
  aktif: boolean;
};

type Props = {
  mode: "create" | "update";
  initialValues?: SliderFormValues;
  currentImage?: string | null;
  submitting: boolean;
  onSubmit: (formData: FormData) => void;
};

const SliderForm: React.FC<Props> = ({ mode, initialValues, currentImage, submitting, onSubmit }) => {
  const [form] = Form.useForm<SliderFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const watched = Form.useWatch([], form) as SliderFormValues | undefined;

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const selectedFile = fileList[0]?.originFileObj;
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : null), [selectedFile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const imageUrl = previewUrl ?? (currentImage ? getImageUrl(currentImage) : null);

  const beforeUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      message.error(`${file.name} 5 MB'tan büyük.`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFinish = (values: SliderFormValues) => {
    const image = fileList[0]?.originFileObj;
    if (mode === "create" && !image) {
      message.error("Görsel zorunludur.");
      return;
    }

    const formData = new FormData();
    formData.append("baslik", (values.baslik ?? "").trim());
    formData.append("altBaslik", (values.altBaslik ?? "").trim());
    formData.append("butonMetni", (values.butonMetni ?? "").trim());
    formData.append("butonLinki", (values.butonLinki ?? "").trim());
    formData.append("aktif", String(values.aktif ?? true));
    if (image) formData.append("resim", image);

    onSubmit(formData);
  };

  const pairRule = (other: keyof SliderFormValues, label: string) => ({
    validator: (_: unknown, value?: string) => {
      const otherValue = (form.getFieldValue(other) as string | undefined)?.trim();
      if (!value?.trim() && otherValue) return Promise.reject(new Error(`${label} da girilmelidir.`));
      return Promise.resolve();
    },
  });

  const submitLabel = mode === "create" ? "Slider'ı Oluştur" : "Değişiklikleri Kaydet";

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{ aktif: true }}
    >
      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          title="Demo sürümünde formu inceleyebilirsiniz, ancak kaydetme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
        <div>
          <Form.Item label="Üst Yazı" name="baslik" rules={[{ max: 40, message: "En fazla 40 karakter." }]}>
            <Input placeholder="Örn. YENİ SEZON" maxLength={40} showCount />
          </Form.Item>

          <Form.Item label="Başlık" name="altBaslik" rules={[{ max: 80, message: "En fazla 80 karakter." }]}>
            <Input placeholder="Örn. Yeni sezon ürünlerini keşfedin" maxLength={80} showCount />
          </Form.Item>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Form.Item
              label="Buton Yazısı"
              name="butonMetni"
              dependencies={["butonLinki"]}
              rules={[{ max: 30, message: "En fazla 30 karakter." }, pairRule("butonLinki", "Buton yazısı")]}
            >
              <Input placeholder="Örn. Alışverişe Başla" maxLength={30} />
            </Form.Item>

            <Form.Item
              label="Buton Linki"
              name="butonLinki"
              dependencies={["butonMetni"]}
              extra="Site içi adres, örn. /shop"
              rules={[
                { pattern: INTERNAL_LINK, message: "/ ile başlayan site içi bir adres girin." },
                pairRule("butonMetni", "Buton linki"),
              ]}
            >
              <Input placeholder="/shop" maxLength={200} />
            </Form.Item>
          </div>

          <Form.Item label="Yayında" name="aktif" valuePropName="checked" extra="Kapalıysa anasayfada gösterilmez.">
            <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" />
          </Form.Item>

          <Form.Item
            label={mode === "create" ? "Görsel" : "Yeni Görsel (opsiyonel)"}
            required={mode === "create"}
            extra="En fazla 5 MB (jpg, png, webp, gif). Yatay ve geniş görseller en iyi sonucu verir."
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList: next }) => setFileList(next.slice(-1))}
              beforeUpload={beforeUpload}
              maxCount={1}
              accept={IMAGE_ACCEPT}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Görsel Seç</Button>
            </Upload>
          </Form.Item>
        </div>

        <div>
          <div style={{ fontSize: 14, marginBottom: 8 }}>Önizleme</div>
          <div
            style={{
              position: "relative",
              height: 240,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #e8edf6",
              background: imageUrl ? `center / cover no-repeat url("${imageUrl}")` : "#f1f4f9",
              display: "flex",
              alignItems: "center",
              padding: "0 28px",
            }}
          >
            {!imageUrl && <span style={{ color: "#999" }}>Görsel seçince önizleme burada görünecek.</span>}
            {imageUrl && (
              <div style={{ maxWidth: "65%" }}>
                {watched?.baslik && (
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 500, letterSpacing: 1 }}>{watched.baslik}</p>
                )}
                {watched?.altBaslik && (
                  <h3 style={{ margin: "6px 0 14px", fontSize: 24, fontWeight: 600, lineHeight: 1.2 }}>
                    {watched.altBaslik}
                  </h3>
                )}
                {watched?.butonMetni && (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      background: "#1367ef",
                      color: "#fff",
                      borderRadius: 4,
                      fontSize: 13,
                    }}
                  >
                    {watched.butonMetni}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

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

export default SliderForm;