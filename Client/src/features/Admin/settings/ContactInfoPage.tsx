import React, { useEffect, useState } from "react";
import { Alert, Button, Form, Input, Spin, message } from "antd";
import { ClockCircleOutlined, EnvironmentOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import requests from "../../../api/requests";
import DemoLockButton from "../../../components/DemoLockButton";
import { isDemo } from "../../../utils/demo";
import { showFormError } from "../../../utils/errors";
import { IContactInfo } from "../../../model/IContactInfo";
import "./ContactInfoPage.css";

const EMAIL_PATTERN = /^[^\s@<>()"]+@[^\s@<>()"]+\.[^\s@<>()"]+$/;

const maxLines = (limit: number, label: string) => ({
  validator: (_: unknown, value?: string) => {
    const count = (value ?? "").split("\n").filter((line) => line.trim()).length;
    return count <= limit
      ? Promise.resolve()
      : Promise.reject(new Error(`${label} en fazla ${limit} satır olabilir.`));
  },
});

const lines = (value?: string) =>
  (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const isSame = (a?: IContactInfo, b?: IContactInfo | null) =>
  !!a && !!b && a.email === b.email && a.address === b.address && a.workingHours === b.workingHours;

const ContactInfoPage: React.FC = () => {
  const [form] = Form.useForm<IContactInfo>();
  const [saved, setSaved] = useState<IContactInfo | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = Form.useWatch([], form) as IContactInfo | undefined;
  const preview = current ?? saved;
  const dirty = loaded && !isSame(current, saved);

  useEffect(() => {
    requests.Contact.getInfo()
      .then((data: IContactInfo) => {
        setSaved(data);
        form.setFieldsValue(data);
      })
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [form]);

  const handleFinish = async (values: IContactInfo) => {
    setSaving(true);
    try {
      const updated: IContactInfo = await requests.Contact.updateInfo({
        email: values.email.trim(),
        address: values.address,
        workingHours: values.workingHours,
      });
      setSaved(updated);
      form.setFieldsValue(updated);
      message.success("İletişim bilgileri güncellendi.");
    } catch (error) {
      showFormError(error, "İletişim bilgileri güncellenemedi.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (saved) form.setFieldsValue(saved);
  };

  return (
    <div className="ci-page animate-fade-in">
      <div className="ci-header">
        <h2>İletişim Bilgileri</h2>
        <p>Bu bilgiler sitedeki iletişim sayfasında gösterilir.</p>
      </div>

      {isDemo && (
        <Alert
          type="info"
          showIcon
          icon={<LockOutlined />}
          message="Demo sürümünde formu inceleyebilirsiniz, ancak kaydetme kapalı."
          style={{ marginTop: 16 }}
        />
      )}

      {!loaded ? (
        <div style={{ display: "grid", placeItems: "center", minHeight: 240 }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className="ci-grid">
          <div className="ci-card">
            <h3 className="ci-card-title">Bilgileri Düzenle</h3>

            <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
              <Form.Item
                label={
                  <span className="ci-label">
                    <MailOutlined /> E-posta
                  </span>
                }
                name="email"
                rules={[
                  { required: true, whitespace: true, message: "E-posta zorunludur." },
                  { pattern: EMAIL_PATTERN, message: "Geçerli bir e-posta adresi girin." },
                  { max: 256, message: "E-posta en fazla 256 karakter olabilir." },
                ]}
              >
                <Input placeholder="destek@magaza.com" maxLength={256} />
              </Form.Item>

              <Form.Item
                label={
                  <span className="ci-label">
                    <ClockCircleOutlined /> Çalışma Saatleri
                  </span>
                }
                name="workingHours"
                extra="Her satır sayfada ayrı bir satır olarak gösterilir. En fazla 6 satır."
                rules={[
                  { required: true, whitespace: true, message: "Çalışma saatleri zorunludur." },
                  { max: 500, message: "Çalışma saatleri en fazla 500 karakter olabilir." },
                  maxLines(6, "Çalışma saatleri"),
                ]}
              >
                <Input.TextArea
                  autoSize={{ minRows: 3, maxRows: 6 }}
                  maxLength={500}
                  showCount
                  placeholder={"Hafta içi 09:00 – 18:00\nHafta sonu kapalı"}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span className="ci-label">
                    <EnvironmentOutlined /> Adres
                  </span>
                }
                name="address"
                extra="En fazla 3 satır."
                rules={[
                  { required: true, whitespace: true, message: "Adres zorunludur." },
                  { max: 300, message: "Adres en fazla 300 karakter olabilir." },
                  maxLines(3, "Adres"),
                ]}
              >
                <Input.TextArea
                  autoSize={{ minRows: 2, maxRows: 3 }}
                  maxLength={300}
                  showCount
                  placeholder={"Mahalle, cadde, no\nİlçe / İl"}
                />
              </Form.Item>

              <div className="ci-actions">
                {dirty && <span className="ci-dirty">Kaydedilmemiş değişiklikler var</span>}
                <Button onClick={handleReset} disabled={!dirty || saving}>
                  Geri Al
                </Button>
                {isDemo ? (
                  <DemoLockButton type="primary">Kaydet</DemoLockButton>
                ) : (
                  <Button type="primary" htmlType="submit" loading={saving} disabled={!dirty}>
                    Kaydet
                  </Button>
                )}
              </div>
            </Form>
          </div>

          <aside className="ci-card ci-preview" aria-label="Önizleme">
            <div className="ci-preview-label">Sitede böyle görünecek</div>

            <div className="ci-preview-item">
              <i className="bi bi-envelope" aria-hidden="true" />
              <div>
                <strong>E-posta</strong>
                {preview?.email ? <p>{preview.email}</p> : <p className="ci-empty">Boş</p>}
              </div>
            </div>

            <div className="ci-preview-item">
              <i className="bi bi-clock" aria-hidden="true" />
              <div>
                <strong>Çalışma Saatleri</strong>
                {lines(preview?.workingHours).length > 0 ? (
                  lines(preview?.workingHours).map((line, index) => <p key={index}>{line}</p>)
                ) : (
                  <p className="ci-empty">Boş</p>
                )}
              </div>
            </div>

            <div className="ci-preview-item">
              <i className="bi bi-geo-alt" aria-hidden="true" />
              <div>
                <strong>Adres</strong>
                {lines(preview?.address).length > 0 ? (
                  lines(preview?.address).map((line, index) => <p key={index}>{line}</p>)
                ) : (
                  <p className="ci-empty">Boş</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ContactInfoPage;