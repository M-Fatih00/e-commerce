import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Upload, message } from "antd";
import type { UploadFile } from "antd";
import { LockOutlined, UploadOutlined } from "@ant-design/icons";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import RichTextEditor from "./RichTextEditor";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 50_000;
const IMAGE_ACCEPT = ".jpg,.jpeg,.png,.webp,.gif";

const hasText = (html: string) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

type Props = {
  mode: "create" | "update";
  initialTitle?: string;
  initialContent?: string;
  currentImage?: string | null;
  submitting: boolean;
  onSubmit: (formData: FormData) => void;
};

const BlogForm: React.FC<Props> = ({ mode, initialTitle, initialContent, currentImage, submitting, onSubmit }) => {
  const [form] = Form.useForm<{ title: string }>();
  const [content, setContent] = useState(initialContent ?? "");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    form.setFieldsValue({ title: initialTitle ?? "" });
  }, [initialTitle, form]);

  const beforeUpload = (file: File) => {
    if (file.size > MAX_IMAGE_SIZE) {
      message.error(`${file.name} 5 MB'tan büyük.`);
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  const handleFinish = ({ title }: { title: string }) => {
    if (!hasText(content)) {
      message.error("Blog içeriği zorunludur.");
      return;
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      message.error("Blog içeriği çok uzun.");
      return;
    }

    const image = fileList[0]?.originFileObj;
    if (mode === "create" && !image) {
      message.error("Görsel zorunludur.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", content);
    if (image) formData.append("image", image);

    onSubmit(formData);
  };

  const submitLabel = mode === "create" ? "Blogu Oluştur" : "Değişiklikleri Kaydet";

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
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
          { max: 200, message: "Başlık en fazla 200 karakter olabilir." },
        ]}
      >
        <Input placeholder="Blog başlığı..." maxLength={200} showCount />
      </Form.Item>

      {currentImage && (
        <Form.Item label="Mevcut Görsel">
          <img
            src={`${baseUrl}/img/${currentImage}`}
            alt="Mevcut görsel"
            width={200}
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

      <Form.Item label="İçerik" required>
        <RichTextEditor value={content} onChange={setContent} />
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

export default BlogForm;