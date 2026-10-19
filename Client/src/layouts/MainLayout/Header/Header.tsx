import React, { useEffect, useState } from "react";
import Proptypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { logoutUser } from "../../../features/Auth/authSlice";
import { selectCartItemCount } from "../../../features/cart/cartSlice";
import { fetchCategories, selectAllCategories } from "../../../features/Categories/categorySlice";
import UserAvatar from "../../../features/Auth/UserAvatar";
import Logo from "../../../components/Logo";

type HeaderProps = {
  setIsSearchShow: React.Dispatch<React.SetStateAction<boolean>>;
};

const MAX_MENU_CATEGORIES = 12;

const SHOP_LINKS = [
  { label: "Tüm Ürünler", to: "/shop" },
  { label: "Sepetim", to: "/cart" },
  { label: "Siparişlerim", to: "/order" },
  { label: "Hesabım", to: "/profile" },
];

function Header({ setIsSearchShow }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItemCount = useAppSelector(selectCartItemCount);
  const { user, roles } = useAppSelector((state) => state.auth);
  const categories = useAppSelector(selectAllCategories);
  const { isLoaded: categoriesLoaded } = useAppSelector((state) => state.category);
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!categoriesLoaded) dispatch(fetchCategories());
  }, [categoriesLoaded, dispatch]);

  const isShopActive = pathname.startsWith("/shop") || pathname.startsWith("/product");

  const linkClass = (active: boolean) => `menu-link ${active ? "active" : ""}`;

  const handleIconKey = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      await dispatch(logoutUser());
      navigate("/auth");
    }
  };

  return (
    <header lang="tr">
      <div className="global-notification">
        <div className="container">
          <p>
            Yeni sezon ürünleri mağazada!
            <Link to="/shop"> ALIŞVERİŞE BAŞLA</Link>
          </p>
        </div>
      </div>

      <div className="header-row">
        <div className="container">
          <div className="header-wrapper">
            <div className="header-mobile">
              <i
                className="bi bi-list"
                id="btn-menu"
                role="button"
                tabIndex={0}
                aria-label="Menüyü aç"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
                onKeyDown={(e) => handleIconKey(e, () => setMenuOpen(true))}
              ></i>
            </div>

            <div className="header-left">
              <Link to="/" className="logo" aria-label="Anasayfa" onClick={() => window.scrollTo(0, 0)}>
                <Logo height={40} />
              </Link>
            </div>

            {menuOpen && (
              <div
                onClick={closeMenu}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.3)",
                  zIndex: 99,
                }}
              />
            )}

            <div className={`header-center ${menuOpen ? "open" : ""}`} id="sidebar">
              <nav className="navigation" onClick={closeMenu} aria-label="Ana menü">
                <ul className="menu-list">
                  <li className="menu-list-item">
                    <Link to="/" className={linkClass(pathname === "/")} onClick={() => window.scrollTo(0, 0)}>
                      Anasayfa
                    </Link>
                  </li>

                  <li className="menu-list-item megamenu-wrapper">
                    <Link to="/shop" className={linkClass(isShopActive)}>
                      Mağaza
                      <i className="bi bi-chevron-down" aria-hidden="true"></i>
                    </Link>
                    <div className="menu-dropdown-wrapper">
                      <div className="menu-dropdown-megamenu">
                        <div className="megamenu-links">
                          {categories.length > 0 && (
                            <div className="megamenu-products">
                              <h3 className="megamenu-products-title">Kategoriler</h3>
                              <ul className="megamenu-menu-list megamenu-category-list">
                                {categories.slice(0, MAX_MENU_CATEGORIES).map((category) => (
                                  <li key={category.id}>
                                    <Link to={`/shop?category=${category.id}`}>{category.name}</Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">Alışveriş</h3>
                            <ul className="megamenu-menu-list">
                              {SHOP_LINKS.map((item) => (
                                <li key={item.label}>
                                  <Link to={item.to}>{item.label}</Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="megamenu-single">
                          <Link to="/shop">
                            <img src={`${import.meta.env.VITE_BASE_URL}/img/mega-menu.jpg`} alt="" />
                          </Link>
                          <h3 className="megamenu-single-title">YENİ SEZON KOLEKSİYONU</h3>
                          <h4 className="megamenu-single-subtitle">Sezonun öne çıkan parçalarını keşfet</h4>
                          <Link to="/shop" className="megamenu-single-button btn btn-sm">
                            Alışverişe Başla
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li className="menu-list-item">
                    <Link to="/blog" className={linkClass(pathname.startsWith("/blog"))}>
                      Blog
                    </Link>
                  </li>

                  <li className="menu-list-item">
                    <Link to="/contact" className={linkClass(pathname === "/contact")}>
                      İletişim
                    </Link>
                  </li>
                </ul>
              </nav>
              <i
                className="bi-x-circle"
                id="close-sidebar"
                role="button"
                tabIndex={0}
                aria-label="Menüyü kapat"
                onClick={closeMenu}
                onKeyDown={(e) => handleIconKey(e, closeMenu)}
              ></i>
            </div>

            <div className="header-right">
              <div className="header-right-links">
                {!user && (
                  <Link
                    to={"/auth"}
                    aria-label="Giriş Yap"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#333",
                      textDecoration: "none",
                    }}
                  >
                    <i className="bi bi-person" aria-hidden="true" />
                    <span className="header-login-label">Giriş Yap</span>
                  </Link>
                )}

                {roles?.includes("Admin") && (
                  <button
                    className="header-admin-btn"
                    onClick={() => navigate("/admin")}
                    style={{
                      background: "#1a1a2e",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "5px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      letterSpacing: 0.3,
                    }}
                  >
                    Admin Paneli
                  </button>
                )}

                {user && (
                  <Link
                    to="/profile"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      textDecoration: "none",
                      color: "inherit",
                      padding: "4px 8px",
                      borderRadius: 8,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f6fa")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <UserAvatar fullName={user.fullName} avatar={user.avatar} size={32} fontSize={12} />
                    <div style={{ lineHeight: 1.3 }}>
                      <div
                        className="header-user-name"
                        style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e" }}
                      >
                        {user.fullName}
                      </div>
                      <div className="header-user-sub" style={{ fontSize: 10, color: "#999" }}>
                        Profilim
                      </div>
                    </div>
                  </Link>
                )}

                {user && (
                  <button
                    className="search-button"
                    onClick={handleLogout}
                    title="Çıkış Yap"
                    aria-label="Çıkış Yap"
                    style={{ color: "#999" }}
                  >
                    <i className="bi bi-box-arrow-right" style={{ fontSize: 18 }} />
                  </button>
                )}

                <div style={{ width: 1, height: 20, background: "#dee0ea" }} />

                <button
                  className="search-button"
                  onClick={() => setIsSearchShow(true)}
                  title="Ara"
                  aria-label="Ürün ara"
                >
                  <i className="bi bi-search" />
                </button>

                <div className="header-cart">
                  <Link to={"/cart"} className="header-cart-link" aria-label={`Sepet, ${cartItemCount} ürün`}>
                    <i className="bi bi-bag" />
                    <span className="header-cart-count">{cartItemCount}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

Header.propTypes = {
  setIsSearchShow: Proptypes.func,
};