import { useState } from "react";
import { message } from "antd";
import axios from "axios";
import "./Contact.css";

function Contact() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.subject || !form.message) {
      message.warning("Tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("contact", form);
      message.success("Mesajınız başarıyla gönderildi!");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Mesaj gönderilemedi.";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact">
      <div className="contact-top">
        <div className="contact-map">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.9633698339308!2d28.929441087738052!3d41.04793012296828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab1d021adf417%3A0xba3a3fdfdbb5f5d!2sEy%C3%BCp%20Sultan%20Camii!5e0!3m2!1str!2str!4v1665091191675!5m2!1str!2str"
            width="100%"
            height="500"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>

      <div className="contact-bottom">
        <div className="container">
          <div className="contact-titles">
            <h4>Contact with us</h4>
            <h2>Get In Touch</h2>
            <p>
              In hac habitasse platea dictumst. Pellentesque viverra sem nec
              orci lacinia, in bibendum urna mollis. Quisque nunc lacus, varius
              vel leo a, pretium lobortis metus.
            </p>
          </div>

          <div className="contact-elements">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div>
                <label>Your Name <span>*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Your Email <span>*</span></label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Subject <span>*</span></label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Your Message <span>*</span></label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                className="btn btn-sm form-button"
                type="submit"
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Send Message"}
              </button>
            </form>

            <div className="contact-info">
              <div className="contact-info-item">
                <div className="contact-info-texts">
                  <strong>Clotya Store</strong>
                  <p className="contact-street">
                    Clotya Store Germany — 785 15h Street, Office 478/B Green Mall Berlin
                  </p>
                  <a href="tel:+1123456788">Phone: +1 1234 567 88</a>
                  <a href="mailto:contact@example.com">Email: contact@example.com</a>
                </div>
              </div>

              <div className="contact-info-item">
                <div className="contact-info-texts">
                  <strong>Opening Hours</strong>
                  <p className="contact-date">Monday - Friday : 9am - 5pm</p>
                  <p>Weekend Closed</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;