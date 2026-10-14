import { useEffect, useState } from "react";
import { Alert, Skeleton, message } from "antd";
import { IContactInfo } from "../../model/IContactInfo";
import { LockOutlined } from "@ant-design/icons";
import requests from "../../api/requests";
import { DEMO_MESSAGE, isDemo } from "../../utils/demo";
import { showFormError } from "../../utils/errors";
import "./Contact.css";

type ContactForm = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const EMPTY_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [info, setInfo] = useState<IContactInfo | null>(null);

  useEffect(() => {
    requests.Contact.getInfo()
      .then(setInfo)
      .catch(() => setInfo({ email: "", address: "", workingHours: "" }));
  }, []);

  const lines = (value?: string) => (value ?? "").split("\n").filter(Boolean);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isDemo) {
      message.info(DEMO_MESSAGE);
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim(),
    };

    if (Object.values(payload).some((value) => !value)) {
      message.warning("Tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      const result = await requests.Contact.send(payload);
      message.success(result?.message ?? "Mesajınız gönderildi.");
      setForm(EMPTY_FORM);
    } catch (error) {
      showFormError(error, "Mesaj gönderilemedi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact">
      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633698339308!2d28.929441087738052!3d41.04793012296828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab1d021adf417%3A0xba3a3fdfdbb5f5d!2sEy%C3%BCp%20Sultan%20Camii!5e0!3m2!1str!2str!4v1665091191675!5m2!1str!2str"
          title="Mağaza konumu"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="container">
        <div className="contact-titles animate-fade-in">
          <h4>İletişim</h4>
          <h2>Bize Ulaşın</h2>
          <p>
            Sipariş, iade ya da ürünlerle ilgili sorularınız için formu
            doldurun; en kısa sürede size dönüş yapalım.
          </p>
        </div>

        <div className="contact-elements">
          <form
            className="contact-form animate-fade-in-up"
            onSubmit={handleSubmit}
          >
            {isDemo && (
              <Alert
                className="contact-demo"
                type="info"
                showIcon
                icon={<LockOutlined />}
                message="Demo sürümünde iletişim formu kapalıdır. Formu inceleyebilirsiniz, ancak mesaj gönderilmez."
              />
            )}

            <div className="contact-field">
              <label htmlFor="contact-name">
                Ad Soyad <span>*</span>
              </label>
              <input
                id="contact-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                autoComplete="name"
                required
              />
            </div>

            <div className="contact-field">
              <label htmlFor="contact-email">
                E-posta <span>*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                maxLength={256}
                autoComplete="email"
                required
              />
            </div>

            <div className="contact-field wide">
              <label htmlFor="contact-subject">
                Konu <span>*</span>
              </label>
              <input
                id="contact-subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                maxLength={150}
                required
              />
            </div>

            <div className="contact-field wide">
              <label htmlFor="contact-message">
                Mesajınız <span>*</span>
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                maxLength={3000}
                rows={6}
                required
              />
            </div>

            <button
              className="btn btn-sm form-button"
              type="submit"
              disabled={loading || isDemo}
            >
              {isDemo ? (
                <>
                  <LockOutlined /> Demo sürümünde kapalı
                </>
              ) : loading ? (
                "Gönderiliyor..."
              ) : (
                "Mesaj Gönder"
              )}
            </button>
          </form>

          <aside
            className="contact-info animate-fade-in-up animate-stagger"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {!info ? (
              [0, 1, 2].map((i) => (
                <div className="contact-info-item" key={i}>
                  <Skeleton active title={false} paragraph={{ rows: 2 }} />
                </div>
              ))
            ) : (
              <>
                {info.email && (
                  <div className="contact-info-item">
                    <i className="bi bi-envelope" aria-hidden="true" />
                    <div>
                      <strong>E-posta</strong>
                      <a href={`mailto:${info.email}`}>{info.email}</a>
                    </div>
                  </div>
                )}

                {info.workingHours && (
                  <div className="contact-info-item">
                    <i className="bi bi-clock" aria-hidden="true" />
                    <div>
                      <strong>Çalışma Saatleri</strong>
                      {lines(info.workingHours).map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}

                {info.address && (
                  <div className="contact-info-item">
                    <i className="bi bi-geo-alt" aria-hidden="true" />
                    <div>
                      <strong>Adres</strong>
                      {lines(info.address).map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

export default Contact;
