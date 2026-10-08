import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginUser } from "./authSlice";

type LoginForm = {
  userName: string;
  password: string;
  rememberMe: boolean;
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

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.loginLoading);

  const [formData, setFormData] = useState<LoginForm>({
    userName: "",
    password: "",
    rememberMe: false,
  });

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
    <div className="account-column">
      <h2>Login</h2>

      <form onSubmit={handleLogin}>
        <div>
          <label>
            <span>
              Username <span className="required">*</span>
            </span>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              autoComplete="username"
              required
            />
          </label>
        </div>

        <div>
          <label>
            <span>
              Password <span className="required">*</span>
            </span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        <p className="remember">
          <label>
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
            <span>Remember me</span>
          </label>

          <button
            className="btn btn-sm"
            disabled={loading || remaining > 0}
            style={{ minWidth: 160, fontVariantNumeric: "tabular-nums" }}
          >
            {loading ? (
              <Spin size="small" />
            ) : remaining > 0 ? (
              `Tekrar dene (${String(remaining).padStart(2, "0")})`
            ) : (
              "Login"
            )}
          </button>
        </p>

        <a href="#" className="form-link">
          Lost your password?
        </a>
      </form>
    </div>
  );
}
