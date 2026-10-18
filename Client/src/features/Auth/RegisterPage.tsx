import { message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { registerUser } from "./authSlice";

type RegisterForm = {
  adSoyad: string;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Props = {
  onSwitch?: () => void;
};

const initialFormState: RegisterForm = {
  adSoyad: "",
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage({ onSwitch }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.registerLoading);

  const [formData, setFormData] = useState<RegisterForm>(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(result)) {
        message.success("Kayıt başarılı, şimdi giriş yapabilirsin");
        setFormData(initialFormState);

        if (onSwitch) onSwitch();
        else navigate("/auth");
      } else {
        message.error("Kayıt başarısız");
      }
    } catch {
      message.error("Bir hata oluştu");
    }
  };

  return (
    <>
      <h1 className="auth-title">Hesap oluştur</h1>
      <p className="auth-subtitle">Birkaç adımda üye ol, siparişlerini kolayca takip et.</p>

      <form className="auth-form" onSubmit={handleRegister}>
        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="register-name">Ad Soyad</label>
            <input
              id="register-name"
              className="auth-input"
              type="text"
              name="adSoyad"
              value={formData.adSoyad}
              onChange={handleInputChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="register-username">Kullanıcı Adı</label>
            <input
              id="register-username"
              className="auth-input"
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              autoComplete="username"
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">E-posta Adresi</label>
          <input
            id="register-email"
            className="auth-input"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="auth-grid">
          <div className="auth-field">
            <label htmlFor="register-password">Şifre</label>
            <div className="auth-password">
              <input
                id="register-password"
                className="auth-input"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                aria-pressed={showPassword}
              >
                <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="register-confirm">Şifre Tekrar</label>
            <div className="auth-password">
              <input
                id="register-confirm"
                className="auth-input"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Şifreyi gizle" : "Şifreyi göster"}
                aria-pressed={showConfirm}
              >
                <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`} />
              </button>
            </div>
          </div>
        </div>

        <p className="auth-note">
          Kişisel verileriniz, hesabınızı yönetmek ve site genelindeki deneyiminizi
          iyileştirmek amacıyla kullanılacaktır.
        </p>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? <span className="auth-spinner" aria-label="Kayıt yapılıyor" /> : "Kayıt Ol"}
        </button>
      </form>

      {onSwitch && (
        <p className="auth-switch">
          Zaten hesabın var mı?{" "}
          <button type="button" onClick={onSwitch}>
            Giriş yap
          </button>
        </p>
      )}
    </>
  );
}