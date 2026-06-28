import { message, Spin } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { loginUser } from "./authSlice";

type LoginForm = {
  userName: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.loginLoading);

  const [formData, setFormData] = useState<LoginForm>({
    userName: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginUser(formData));

      if (loginUser.fulfilled.match(result)) {
        message.success("Giriş başarılı");

        const user: any = result.payload;

        if (user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        message.error("Giriş başarısız");
      }
    } catch (error) {
      message.error("Bir hata oluştu");
    }
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

          <button className="btn btn-sm" disabled={loading}>
            {loading ? <Spin size="small" /> : "Login"}
          </button>
        </p>

        <a href="#" className="form-link">
          Lost your password?
        </a>
      </form>
    </div>
  );
}
