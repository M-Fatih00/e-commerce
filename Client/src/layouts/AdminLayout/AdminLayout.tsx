import Loader from "../../components/Loader";
import { Dropdown, Layout, Menu, type MenuProps } from "antd";
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
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { ReactNode, Suspense, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { logoutUser } from "../../features/Auth/authSlice";
import UserAvatar from "../../features/Auth/UserAvatar";
import Logo from "../../components/Logo";

const { Sider, Content, Header } = Layout;

type NavLink = { key: string; label: string; path: string };
type NavGroup = {
  key: string;
  label: string;
  icon: ReactNode;
  children: NavLink[];
};
type NavItem = (NavLink & { icon: ReactNode }) | NavGroup;
type FlatLink = NavLink & { parent?: NavGroup };

const NAV: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <DashboardOutlined />,
    path: "/admin",
  },
  {
    key: "categories",
    label: "Kategoriler",
    icon: <AppstoreOutlined />,
    children: [
      {
        key: "categories-list",
        label: "Kategori Listesi",
        path: "/admin/categories",
      },
      {
        key: "categories-create",
        label: "Yeni Kategori",
        path: "/admin/categories/create",
      },
    ],
  },
  {
    key: "products",
    label: "Ürünler",
    icon: <LaptopOutlined />,
    children: [
      { key: "products-list", label: "Ürün Listesi", path: "/admin/products" },
      {
        key: "products-create",
        label: "Yeni Ürün",
        path: "/admin/products/create",
      },
    ],
  },
  {
    key: "blogs",
    label: "Blog",
    icon: <BookOutlined />,
    children: [
      { key: "blogs-list", label: "Blog Listesi", path: "/admin/blogs" },
      { key: "blogs-create", label: "Yeni Blog", path: "/admin/blogs/create" },
    ],
  },
  {
    key: "coupons",
    label: "Kuponlar",
    icon: <BarcodeOutlined />,
    children: [
      { key: "coupons-list", label: "Kupon Listesi", path: "/admin/coupons" },
      {
        key: "coupons-create",
        label: "Yeni Kupon",
        path: "/admin/coupons/create",
      },
    ],
  },
  {
    key: "campaigns",
    label: "Kampanyalar",
    icon: <PictureOutlined />,
    children: [
      {
        key: "campaigns-list",
        label: "Kampanya Listesi",
        path: "/admin/campaigns",
      },
      {
        key: "campaigns-create",
        label: "Yeni Kampanya",
        path: "/admin/campaigns/create",
      },
    ],
  },
  {
    key: "users",
    label: "Kullanıcılar",
    icon: <UserOutlined />,
    path: "/admin/users",
  },
  {
    key: "orders",
    label: "Siparişler",
    icon: <ShoppingCartOutlined />,
    path: "/admin/orders",
  },
  {
    key: "settings-contact",
    label: "İletişim Bilgileri",
    icon: <SettingOutlined />,
    path: "/admin/settings/contact",
  },
];

const FLAT_LINKS: FlatLink[] = NAV.flatMap((item) =>
  "children" in item
    ? item.children.map((child) => ({ ...child, parent: item }))
    : [{ key: item.key, label: item.label, path: item.path }],
);

const findActiveLink = (pathname: string): FlatLink | undefined =>
  FLAT_LINKS.filter(
    (link) =>
      pathname === link.path ||
      (link.path !== "/admin" && pathname.startsWith(`${link.path}/`)),
  ).sort((a, b) => b.path.length - a.path.length)[0];

const getBreadcrumb = (pathname: string, active?: FlatLink): string[] => {
  if (!active) return ["Admin Panel"];
  if (!active.parent) return [active.label];
  return [
    active.parent.label,
    pathname.includes("/update/") ? "Güncelle" : active.label,
  ];
};

const AdminFallback = <Loader minHeight={400} />;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, roles, status } = useAppSelector((state) => state.auth);
  const [collapsed, setCollapsed] = useState(false);

  const activeLink = findActiveLink(location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>(
    activeLink?.parent ? [activeLink.parent.key] : [],
  );

  useEffect(() => {
    const parentKey = findActiveLink(location.pathname)?.parent?.key;
    if (parentKey)
      setOpenKeys((prev) =>
        prev.includes(parentKey) ? prev : [...prev, parentKey],
      );
  }, [location.pathname]);

  if (status !== "ready") return null;
  if (!user) return <Navigate to="/auth" replace />;
  if (!roles?.includes("Admin")) return <Navigate to="/not-found" replace />;

  const siderWidth = collapsed ? 80 : 220;
  const breadcrumb = getBreadcrumb(location.pathname, activeLink);

  const menuItems: MenuProps["items"] = [
    ...NAV.map((item) =>
      "children" in item
        ? {
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: item.children.map((child) => ({
              key: child.key,
              label: child.label,
              onClick: () => navigate(child.path),
            })),
          }
        : {
            key: item.key,
            icon: item.icon,
            label: item.label,
            onClick: () => navigate(item.path),
          },
    ),
    { type: "divider" as const },
    {
      key: "home",
      icon: <RollbackOutlined />,
      label: "Ana Sayfa",
      onClick: () => navigate("/"),
    },
  ];

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
          <Logo variant="light" showText={false} height={34} />
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
          selectedKeys={activeLink ? [activeLink.key] : []}
          {...(collapsed ? {} : { openKeys, onOpenChange: setOpenKeys })}
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
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
              style={{
                cursor: "pointer",
                fontSize: 18,
                color: "#555",
                display: "flex",
                alignItems: "center",
                background: "none",
                border: "none",
                padding: 0,
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <nav aria-label="Konum">
              <span style={{ color: "#999", fontSize: 13 }}>Admin</span>
              {breadcrumb.map((part, index) => (
                <span key={`${part}-${index}`}>
                  <span
                    style={{ color: "#999", fontSize: 13, margin: "0 6px" }}
                  >
                    /
                  </span>
                  <span
                    style={{
                      color:
                        index === breadcrumb.length - 1 ? "#1a1a2e" : "#999",
                      fontSize: 13,
                      fontWeight: index === breadcrumb.length - 1 ? 500 : 400,
                    }}
                  >
                    {part}
                  </span>
                </span>
              ))}
            </nav>
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
