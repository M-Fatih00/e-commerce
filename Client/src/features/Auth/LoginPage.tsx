import { message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginUser } from "./authSlice";
import DemoAccounts from "./DemoAccounts";
import { IDemoAccount } from "../../model/IDemoAccount";

type LoginForm = {
  userName: string;
  password: string;
  rememberMe: boolean;
};

type Props = {
  onSwitch?: () => void;
};

const RETRY_KEY = "loginRetryAt";
const WAIT_SECONDS = 60;

function readRetryAt(): number {
  try {
    const value = Number(localStorage.getItem(RETRY_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeRetryAt(value: number | null) {
  try {
    if (value === null) localStorage.removeItem(RETRY_KEY);
    else localStorage.setItem(RETRY_KEY, String(value));
  } catch {
    return;
  }
}

export default function LoginPage({ onSwitch }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.loginLoading);

  const [formData, setFormData] = useState<LoginForm>({
    userName: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  const [retryAt, setRetryAt] = useState<number>(readRetryAt);
  const [now, setNow] = useState<number>(Date.now());
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));

  useEffect(() => {
    if (retryAt <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [retryAt]);

  useEffect(() => {
    if (retryAt > 0 && remaining === 0) {
      writeRetryAt(null);
      setRetryAt(0);
    }
  }, [remaining, retryAt]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDemoSelect = (account: IDemoAccount) => {
    setFormData((prev) => ({
      ...prev,
      userName: account.userName,
      password: account.password,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (remaining > 0) return;

    const result = await dispatch(
      loginUser({ ...formData, userName: formData.userName.trim() }),
    );

    if (loginUser.fulfilled.match(result)) {
      message.success("Giriş başarılı");
      navigate("/");
      return;
    }

    const error = result.payload;

    if (error?.status === 429) {
      const until = Date.now() + WAIT_SECONDS * 1000;
      writeRetryAt(until);
      setNow(Date.now());
      setRetryAt(until);
      message.warning(
        `Çok fazla deneme yaptınız. Lütfen ${WAIT_SECONDS} saniye bekleyin.`,
      );
      return;
    }

    message.error(error?.message ?? "Giriş yapılamadı. Lütfen tekrar deneyin.");
  };

  return (
    <>
      <h1 className="auth-title">Tekrar hoş geldin</h1>
      <p className="auth-subtitle">Hesabına giriş yaparak alışverişe devam et.</p>

      <DemoAccounts selectedUserName={formData.userName} onSelect={handleDemoSelect} />

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="login-username">Kullanıcı Adı</label>
          <input
            id="login-username"
            className="auth-input"
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            autoComplete="username"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="login-password">Şifre</label>
          <div className="auth-password">
            <input
              id="login-password"
              className="auth-input"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
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

        <div className="auth-row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  rememberMe: e.target.checked,
                })
              }
            />
            <span>Beni hatırla</span>
          </label>

          <a href="#" className="auth-link-muted">
            Şifremi unuttum
          </a>
        </div>

        <button type="submit" className="auth-submit" disabled={loading || remaining > 0}>
          {loading ? (
            <span className="auth-spinner" aria-label="Giriş yapılıyor" />
          ) : remaining > 0 ? (
            `Tekrar dene (${String(remaining).padStart(2, "0")})`
          ) : (
            "Giriş Yap"
          )}
        </button>
      </form>

      {onSwitch && (
        <p className="auth-switch">
          Hesabın yok mu?{" "}
          <button type="button" onClick={onSwitch}>
            Kayıt ol
          </button>
        </p>
      )}
    </>
  );
}