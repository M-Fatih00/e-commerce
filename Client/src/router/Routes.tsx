import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy } from "react";
import App from "../layouts/App";
import MainLayout from "../layouts/MainLayout/MainLayout";
import AdminLayout from "../layouts/AdminLayout/AdminLayout";

// Public Pages
import HomePage from "../features/HomePage";
import Contact from "../features/Contact/Contact";
import BlogPage from "../features/Blogs/BlogPage";
import ShopPage from "../features/ShopPage";
import BlogDetailsPage from "../features/Blogs/BlogDetailsPage";
import AuthPage from "../features/Auth/AuthPage";
import ProfilePage from "../features/Auth/ProfilePage";
import ProductDetailsPage from "../features/catalog/ProductDetails/ProductDetailsPage";
import CartPage from "../features/cart/CartPage";
import CheckoutPage from "../features/Checkout/CheckoutPage";
import OrderPage from "../features/Orders/OrderPage";
import OrderSuccess from "../features/Orders/OrderSuccess";
import OrderFailed from "../features/Orders/OrderFailed";
import ServerError from "../features/Errors/ServerError";
import NotFound from "../features/Errors/NotFound";

// Lazy Admin Pages
const Dashboard = lazy(() => import("../features/Admin/Dashboard"));
const ProductPageAdmin = lazy(() => import("../features/Admin/products/ProductPageAdmin"));
const CreateProduct = lazy(() => import("../features/Admin/products/CreateProduct"));
const UpdateProduct = lazy(() => import("../features/Admin/products/UpdateProduct"));

const CategoryPageAdmin = lazy(() => import("../features/Admin/categories/CategoryPageAdmin"));
const CreateCategory = lazy(() => import("../features/Admin/categories/CreateCategory"));
const UpdateCategory = lazy(() => import("../features/Admin/categories/UpdateCategory"));

const BlogPageAdmin = lazy(() => import("../features/Admin/blogs/BlogPageAdmin"));
const CreateBlog = lazy(() => import("../features/Admin/blogs/CreateBlog"));
const UpdateBlog = lazy(() => import("../features/Admin/blogs/UpdateBlog"));

const CouponPage = lazy(() => import("../features/Coupon/CouponPage"));
const CreateCoupon = lazy(() => import("../features/Coupon/CreateCoupon"));
const UpdateCoupon = lazy(() => import("../features/Coupon/UpdateCoupon"));

const CampaignPageAdmin = lazy(() => import("../features/Admin/Campaigns/CampaignPageAdmin"));
const CreateCampaign = lazy(() => import("../features/Admin/Campaigns/CreateCampaign"));
const UpdateCampaign = lazy(() => import("../features/Admin/Campaigns/UpdateCampaign"));

const UserPage = lazy(() => import("../features/Admin/UserPage"));
const OrderPageAdmin = lazy(() => import("../features/Admin/OrderPageAdmin"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        children: [
          { path: "", element: <HomePage /> },
          { path: "shop", element: <ShopPage /> },
          { path: "blog", element: <BlogPage /> },
          { path: "contact", element: <Contact /> },
          { path: "auth", element: <AuthPage /> },
          { path: "profile", element: <ProfilePage /> },
          { path: "blog/:id", element: <BlogDetailsPage /> },
          { path: "product/:id", element: <ProductDetailsPage /> },
          { path: "cart", element: <CartPage /> },
          { path: "checkout", element: <CheckoutPage /> },
          { path: "order", element: <OrderPage /> },
          { path: "order-success", element: <OrderSuccess /> },
          { path: "order-failed", element: <OrderFailed /> },
          { path: "server-error", element: <ServerError /> },
          { path: "not-found", element: <NotFound /> },
          { path: "*", element: <Navigate to="/not-found" replace /> },
        ],
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Dashboard /> },

          { path: "products", element: <ProductPageAdmin /> },
          { path: "products/create", element: <CreateProduct /> },
          { path: "products/update/:id", element: <UpdateProduct /> },

          { path: "categories", element: <CategoryPageAdmin /> },
          { path: "categories/create", element: <CreateCategory /> },
          { path: "categories/update/:id", element: <UpdateCategory /> },

          { path: "blogs", element: <BlogPageAdmin /> },
          { path: "blogs/create", element: <CreateBlog /> },
          { path: "blogs/update/:id", element: <UpdateBlog /> },

          { path: "coupons", element: <CouponPage /> },
          { path: "coupons/create", element: <CreateCoupon /> },
          { path: "coupons/update/:id", element: <UpdateCoupon /> },

          { path: "campaigns", element: <CampaignPageAdmin /> },
          { path: "campaigns/create", element: <CreateCampaign /> },
          { path: "campaigns/update/:id", element: <UpdateCampaign /> },

          { path: "users", element: <UserPage /> },
          { path: "orders", element: <OrderPageAdmin /> },

          { path: "*", element: <Navigate to="/admin" replace /> },
        ],
      },
    ],
  },
]);