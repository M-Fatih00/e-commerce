import { Layout, Menu, Dropdown, Spin } from "antd";
import {
  UserOutlined,
  LaptopOutlined,
  RollbackOutlined,
  BarcodeOutlined,
  DashboardOutlined,
  ShoppingCartOutlined,
  AppstoreOutlined,
  BookOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { logoutUser } from "../../features/Auth/authSlice";
import { Suspense, useState } from "react";
import UserAvatar from "../../features/Auth/UserAvatar";

const { Sider, Content, Header } = Layout;

const AdminFallback = (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "60vh",
    }}
  >
    <Spin size="large" />
  </div>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, roles, status } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  if (status !== "ready") return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!roles.includes("Admin")) return <Navigate to="/not-found" replace />;

  const siderWidth = collapsed ? 80 : 220;

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/admin"),
      path: "/admin",
    },
    {
      key: "2",
      icon: <AppstoreOutlined />,
      label: "Kategoriler",
      children: [
        {
          key: "3",
          label: "Kategori Listesi",
          onClick: () => navigate("/admin/categories"),
          path: "/admin/categories",
        },
        {
          key: "4",
          label: "Yeni Kategori",
          onClick: () => navigate("/admin/categories/create"),
          path: "/admin/categories/create",
        },
      ],
    },
    {
      key: "5",
      icon: <LaptopOutlined />,
      label: "Ürünler",
      children: [
        {
          key: "6",
          label: "Ürün Listesi",
          onClick: () => navigate("/admin/products"),
          path: "/admin/products",
        },
        {
          key: "7",
          label: "Yeni Ürün",
          onClick: () => navigate("/admin/products/create"),
          path: "/admin/products/create",
        },
      ],
    },
    {
      key: "8",
      icon: <BookOutlined />,
      label: "Blog",
      children: [
        {
          key: "9",
          label: "Blog Listesi",
          onClick: () => navigate("/admin/blogs"),
          path: "/admin/blogs",
        },
        {
          key: "10",
          label: "Yeni Blog",
          onClick: () => navigate("/admin/blogs/create"),
          path: "/admin/blogs/create",
        },
      ],
    },
    {
      key: "11",
      icon: <BarcodeOutlined />,
      label: "Kuponlar",
      children: [
        {
          key: "12",
          label: "Kupon Listesi",
          onClick: () => navigate("/admin/coupons"),
          path: "/admin/coupons",
        },
        {
          key: "13",
          label: "Yeni Kupon",
          onClick: () => navigate("/admin/coupons/create"),
          path: "/admin/coupons/create",
        },
      ],
    },
    {
      key: "17",
      icon: <PictureOutlined />,
      label: "Kampanyalar",
      children: [
        {
          key: "18",
          label: "Kampanya Listesi",
          onClick: () => navigate("/admin/campaigns"),
          path: "/admin/campaigns",
        },
        {
          key: "19",
          label: "Yeni Kampanya",
          onClick: () => navigate("/admin/campaigns/create"),
          path: "/admin/campaigns/create",
        },
      ],
    },
    {
      key: "14",
      icon: <UserOutlined />,
      label: "Kullanıcılar",
      onClick: () => navigate("/admin/users"),
      path: "/admin/users",
    },
    {
      key: "15",
      icon: <ShoppingCartOutlined />,
      label: "Siparişler",
      onClick: () => navigate("/admin/orders"),
      path: "/admin/orders",
    },
    {
      key: "divider",
      type: "divider" as const,
    },
    {
      key: "16",
      icon: <RollbackOutlined />,
      label: "Ana Sayfa",
      onClick: () => navigate("/"),
    },
  ];

  const getActiveKey = () => {
    for (const item of menuItems) {
      if ("children" in item && item.children) {
        for (const child of item.children) {
          if ("path" in child && child.path === location.pathname)
            return child.key;
        }
      } else {
        if ("path" in item && item.path === location.pathname) return item.key;
      }
    }
    return "1";
  };

  const getPageTitle = () => {
    for (const item of menuItems) {
      if ("children" in item && item.children) {
        for (const child of item.children) {
          if ("path" in child && child.path === location.pathname)
            return child.label;
        }
      } else {
        if ("path" in item && item.path === location.pathname)
          return item.label;
      }
    }
    return "Admin Panel";
  };

  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Çıkış Yap",
      onClick: () => dispatch(logoutUser()),
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", background: "#f5f6fa" }}>
      <Sider
        width={220}
        collapsedWidth={80}
        collapsed={collapsed}
        theme="dark"
        style={{
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          background: "#1a1a2e",
          overflow: "auto",
          boxShadow: "2px 0 8px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            height: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            cursor: "pointer",
          }}
          onClick={() => navigate("/admin")}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2c3e50, #3498db)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            A
          </div>
          {!collapsed && (
            <span
              style={{
                marginLeft: 10,
                color: "#fff",
                fontWeight: 600,
                fontSize: 15,
                whiteSpace: "nowrap",
              }}
            >
              Admin Panel
            </span>
          )}
        </div>

        <Menu
          mode="inline"
          items={menuItems}
          selectedKeys={[getActiveKey()]}
          theme="dark"
          motion={{
            motionName: "",
            motionAppear: false,
            motionEnter: false,
            motionLeave: false,
          }}
          style={{
            background: "transparent",
            border: "none",
            marginTop: 8,
          }}
        />
      </Sider>

      <Layout
        style={{
          marginLeft: siderWidth,
          transition: "margin-left 0.2s",
          background: "#f5f6fa",
        }}
      >
        <Header
          style={{
            background: "#fff",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 99,
            boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            height: 64,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                cursor: "pointer",
                fontSize: 18,
                color: "#555",
                display: "flex",
                alignItems: "center",
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <div>
              <span style={{ color: "#999", fontSize: 13 }}>Admin</span>
              <span style={{ color: "#999", fontSize: 13, margin: "0 6px" }}>
                /
              </span>
              <span style={{ color: "#1a1a2e", fontSize: 13, fontWeight: 500 }}>
                {getPageTitle()}
              </span>
            </div>
          </div>

          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: 8,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f5f6fa")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <UserAvatar
                fullName={user.fullName}
                avatar={user.avatar}
                size={34}
                fontSize={14}
              />
              <div style={{ lineHeight: 1.3 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 500, color: "#1a1a2e" }}
                >
                  {user.fullName}
                </div>
                <div style={{ fontSize: 11, color: "#999" }}>Admin</div>
              </div>
            </div>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: "#fff",
            borderRadius: 12,
            minHeight: "calc(100vh - 64px - 48px)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <Suspense fallback={AdminFallback}>
            <Outlet />
          </Suspense>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
