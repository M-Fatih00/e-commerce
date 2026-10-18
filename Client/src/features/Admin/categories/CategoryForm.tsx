import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { LockOutlined, UploadOutlined } from "@ant-design/icons";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

type Props = {
  mode: "create" | "update";
  initialName?: string;
  currentImage?: string | null;
  submitting: boolean;
  onSubmit: (formData: FormData) => void;
};

const CategoryForm: React.FC<Props> = ({ mode, initialName, currentImage, submitting, onSubmit }) => {
  const [form] = Form.useForm<{ name: string }>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    form.setFieldsValue({ name: initialName ?? "" });
  }, [initialName, form]);

  const beforeUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      message.error(`${file.name} 5 MB'tan büyük.`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFinish = ({ name }: { name: string }) => {
    const image = fileList[0]?.originFileObj;
    if (mode === "create" && !image) {
      message.error("Görsel zorunludur.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    if (image) formData.append("image", image);

    onSubmit(formData);
  };

  const submitLabel = mode === "create" ? "Kategoriyi Oluştur" : "Değişiklikleri Kaydet";

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
        label="Kategori Adı"
        name="name"
        rules={[
          { required: true, whitespace: true, message: "Kategori adı zorunludur." },
          { max: 50, message: "Kategori adı en fazla 50 karakter olabilir." },
        ]}
      >
        <Input placeholder="Örn: Elektronik" maxLength={50} />
      </Form.Item>

      {currentImage && (
        <Form.Item label="Mevcut Görsel">
          <img
            src={`${baseUrl}/img/${currentImage}`}
            alt="Mevcut görsel"
            width={120}
            style={{ borderRadius: 8, objectFit: "cover" }}
          />
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

export default CategoryForm;