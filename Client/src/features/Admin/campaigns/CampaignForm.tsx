import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, InputNumber, Select, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { LockOutlined, UploadOutlined } from "@ant-design/icons";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { getImageUrl } from "../../../utils/image";
import { ICategory } from "../../../model/ICategory";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

export type CampaignFormValues = {
  title: string;
  description?: string;
  categoryId: number;
  index: number;
};

type Props = {
  mode: "create" | "update";
  initialValues?: Partial<CampaignFormValues>;
  currentImage?: string | null;
  disabled?: boolean;
  submitting: boolean;
  onSubmit: (formData: FormData) => void;
};

const CampaignForm: React.FC<Props> = ({ mode, initialValues, currentImage, disabled, submitting, onSubmit }) => {
  const [form] = Form.useForm<CampaignFormValues>();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    requests.Categories.list().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
  }, [initialValues, form]);

  const beforeUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      message.error(`${file.name} 5 MB'tan büyük.`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFinish = (values: CampaignFormValues) => {
    const image = fileList[0]?.originFileObj;
    if (mode === "create" && !image) {
      message.error("Görsel zorunludur.");
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("description", (values.description ?? "").trim());
    formData.append("categoryId", String(values.categoryId));
    formData.append("index", String(values.index ?? 0));
    if (image) formData.append("resim", image);

    onSubmit(formData);
  };

  const submitLabel = mode === "create" ? "Kampanyayı Oluştur" : "Değişiklikleri Kaydet";

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish} disabled={disabled}>
      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Demo sürümünde formu inceleyebilirsiniz, ancak kaydetme kapalı."
          style={{ marginBottom: 16 }}
        />
      )}

      <Form.Item
        label="Başlık"
        name="title"
        rules={[
          { required: true, whitespace: true, message: "Başlık zorunludur." },
          { max: 100, message: "Başlık en fazla 100 karakter olabilir." },
        ]}
      >
        <Input placeholder="Kampanya başlığı..." maxLength={100} showCount />
      </Form.Item>

      <Form.Item label="Açıklama" name="description" rules={[{ max: 300, message: "Açıklama en fazla 300 karakter olabilir." }]}>
        <Input.TextArea rows={3} placeholder="Kampanya açıklaması..." maxLength={300} showCount />
      </Form.Item>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        <Form.Item label="Kategori" name="categoryId" rules={[{ required: true, message: "Kategori seçin." }]}>
          <Select placeholder="Kategori seçin" options={categories.map((c) => ({ value: c.id, label: c.name }))} />
        </Form.Item>

        <Form.Item label="Sıra" name="index" extra="Küçük sayı önce gösterilir.">
          <InputNumber min={0} max={99} precision={0} style={{ width: "100%" }} />
        </Form.Item>
      </div>

      {currentImage && (
        <Form.Item label="Mevcut Görsel">
          <img src={getImageUrl(currentImage)} alt="Mevcut görsel" width={200} style={{ borderRadius: 8, objectFit: "cover" }} />
        </Form.Item>
      )}

      <Form.Item
        label={mode === "create" ? "Görsel" : "Yeni Görsel (opsiyonel)"}
        required={mode === "create"}
        extra="En fazla 5 MB (jpg, png, webp, gif)."
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

export default CampaignForm;