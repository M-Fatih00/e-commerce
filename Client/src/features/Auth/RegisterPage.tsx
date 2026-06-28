import { message, Spin } from "antd";
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

const initialFormState: RegisterForm = {
  adSoyad: "",
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loading = useAppSelector((state) => state.auth.registerLoading);

  const [formData, setFormData] = useState<RegisterForm>(initialFormState);

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
        message.success("Kayıt başarılı");

        setFormData(initialFormState);

        setTimeout(() => {
          navigate("/auth");
        }, 1500);
      } else {
        message.error("Kayıt başarısız");
      }
    } catch (error) {
      message.error("Bir hata oluştu");
    }
  };

  return (
    <div className="account-column">
      <h2>Register</h2>

      <form onSubmit={handleRegister}>
        <div>
          <label>
            <span>
              Full Name <span className="required">*</span>
            </span>
            <input
              type="text"
              name="adSoyad" // DTO'daki isimle eşleşmeli
              value={formData.adSoyad}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

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
              Email address <span className="required">*</span>
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
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
        <div>
          <label>
            <span>
              Confirm Password <span className="required">*</span>
            </span>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>

        <div className="privacy-policy-text remember">
          <p>
            Your personal data will be used to support your experience
            throughout this website, to manage access to your account.
          </p>

          <button className="btn btn-sm" disabled={loading}>
            {loading ? <Spin size="small" /> : "Register"}
          </button>
        </div>
      </form>
    </div>
  );
}
