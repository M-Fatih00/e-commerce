import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import "./Auth.css"
import { useAppSelector } from "../../store/store";
import { Navigate } from "react-router-dom";

function AuthPage() {
  const { user } = useAppSelector((state) => state.auth);

  if (user) return <Navigate to="/" replace />;
  return (
    <section className="account-page">
      <div className="container">
        <div className="account-wrapper">
          <LoginPage />
          <RegisterPage />
        </div>
      </div>
    </section>
  );
}

export default AuthPage;
