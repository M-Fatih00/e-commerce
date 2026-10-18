import { Navigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import Logo from "../../components/Logo";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import "./Auth.css";

type Mode = "login" | "register";

const BENEFITS = [
  { icon: "bi-box-seam", text: "Siparişlerini adım adım takip et" },
  { icon: "bi-shield-check", text: "Stripe altyapısıyla güvenli ödeme" },
  { icon: "bi-star", text: "Aldığın ürünleri değerlendir" },
];

const TABS: { mode: Mode; label: string }[] = [
  { mode: "login", label: "Giriş Yap" },
  { mode: "register", label: "Kayıt Ol" },
];

function AuthPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const mode: Mode = searchParams.get("mode") === "register" ? "register" : "login";

  if (user) return <Navigate to="/" replace />;

  const changeMode = (next: Mode) => {
    setSearchParams(next === "register" ? { mode: "register" } : {}, { replace: true });
  };

  return (
    <section className="auth-page">
      <div className="auth-shell">
        <aside className="auth-aside">
          <Logo height={40} />

          <div>
            <h2>Tarzını keşfet, alışverişin keyfini çıkar.</h2>
            <ul>
              {BENEFITS.map((item) => (
                <li key={item.text}>
                  <i className={`bi ${item.icon}`} />
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="auth-aside-note">E-Commerce · Moda &amp; Giyim</p>
        </aside>

        <div className="auth-main">
          <div className="auth-tabs" role="tablist" aria-label="Hesap işlemleri">
            {TABS.map((tab) => (
              <button
                key={tab.mode}
                type="button"
                role="tab"
                id={`auth-tab-${tab.mode}`}
                aria-selected={mode === tab.mode}
                aria-controls={`auth-panel-${tab.mode}`}
                className={`auth-tab ${mode === tab.mode ? "active" : ""}`}
                onClick={() => changeMode(tab.mode)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="auth-panels">
            <div
              id="auth-panel-login"
              role="tabpanel"
              aria-labelledby="auth-tab-login"
              className={`auth-panel ${mode === "login" ? "active" : ""}`}
            >
              <LoginPage onSwitch={() => changeMode("register")} />
            </div>

            <div
              id="auth-panel-register"
              role="tabpanel"
              aria-labelledby="auth-tab-register"
              className={`auth-panel ${mode === "register" ? "active" : ""}`}
            >
              <RegisterPage onSwitch={() => changeMode("login")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AuthPage;