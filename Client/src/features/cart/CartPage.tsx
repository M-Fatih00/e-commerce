import React from "react";
import CartProgress from "./CartProgress";
import CartTable from "./CartTable";
import CartCoupon from "./CartCoupon";
import CartTotals from "./CartTotals";
import { useAppSelector } from "../../store/store";
import { selectAllCartItems } from "./cartSlice";
import { Spin } from "antd";
import { Link } from "react-router-dom";
import "./Cart.css";

const CartPage: React.FC = () => {
  const cartItems = useAppSelector(selectAllCartItems);
  const initialLoading = useAppSelector((state) => state.cart.initialLoading);
  const { user } = useAppSelector((state) => state.auth);

  if (initialLoading) {
    return (
      <section className="cart-page">
        <div className="container">
          <Spin size="large" />
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="cart-page">
        <div className="container">
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            textAlign: "center",
          }}>
            <i className="bi bi-bag" style={{ fontSize: 64, color: "#dee0ea", marginBottom: 24 }} />
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Sepetinizi görüntülemek için giriş yapın
            </h2>
            <p style={{ color: "#999", fontSize: 14, marginBottom: 32 }}>
              Hesabınıza giriş yaparak sepetinize eklediğiniz ürünlere ulaşabilirsiniz.
            </p>
            <Link
              to="/auth"
              className="btn btn-primary"
              style={{ padding: "12px 40px", fontSize: 15 }}
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        {cartItems.length > 0 ? (
          <div className="cart-page-wrapper">
            <div className="cart-form">
              <CartProgress />
              <div className="shop-table-wrapper">
                <CartTable />
                <CartCoupon />
              </div>
            </div>
            <div className="cart-collaterals">
              <CartTotals />
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px",
            textAlign: "center",
          }}>
            <i className="bi bi-bag-x" style={{ fontSize: 64, color: "#dee0ea", marginBottom: 24 }} />
            <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 8 }}>
              Sepetiniz boş
            </h2>
            <p style={{ color: "#999", fontSize: 14, marginBottom: 32 }}>
              Henüz sepetinize ürün eklemediniz.
            </p>
            <Link
              to="/shop"
              className="btn btn-primary"
              style={{ padding: "12px 40px", fontSize: 15 }}
            >
              Alışverişe Başla
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartPage;