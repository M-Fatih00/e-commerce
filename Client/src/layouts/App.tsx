import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/store";
import { ToastContainer } from "react-toastify";
import { CssBaseline } from "@mui/material";
import { Spin } from "antd";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-toastify/dist/ReactToastify.css";
import { Outlet } from "react-router-dom";
import { getUser } from "../features/Auth/authSlice";
import ScrollToTop from "../features/ScrollToTop";
import { getCart } from "../features/cart/cartSlice";

function App() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getCart());
    }
  }, [isAuthenticated, dispatch]);

  if (status === "loading") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff",
          zIndex: 9999,
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
      <CssBaseline />
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export default App;
