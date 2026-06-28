import React, { useState } from "react";
import Proptypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Header.css";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { logoutUser } from "../../../features/Auth/authSlice";
import { selectCartItemCount } from "../../../features/cart/cartSlice";
import UserAvatar from "../../../features/Auth/UserAvatar";

type HeaderProps = {
  setIsSearchShow: React.Dispatch<React.SetStateAction<boolean>>;
};

function Header({ setIsSearchShow }: HeaderProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItemCount = useAppSelector(selectCartItemCount);
  const { user, roles } = useAppSelector((state) => state.auth);
  const { pathname } = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      await dispatch(logoutUser());
      navigate("/auth");
    }
  };

  return (
    <header>
      <div className="global-notification">
        <div className="container">
          <p>
            SUMMER SALE FOR ALL SWIM SUITS AND FREE EXPRESS INTERNATIONAL
            DELIVERY - OFF 50%!
            <Link to="/shop"> SHOP NOW </Link>
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
                onClick={() => setMenuOpen(true)}
              ></i>
            </div>

            <div className="header-left">
              <Link
                to={"/"}
                className="logo"
                onClick={() => window.scrollTo(0, 0)}
              >
                LOGO
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

            <div
              className={`header-center ${menuOpen ? "open" : ""}`}
              id="sidebar"
            >
              <nav className="navigation" onClick={closeMenu}>
                <ul className="menu-list">
                  <li className="menu-list-item">
                    <Link
                      to={"/"}
                      className={`menu-link ${pathname === "/" && "active"}`}
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      Home
                      <i className="bi bi-chevron-down"></i>
                    </Link>
                    <div className="menu-dropdown-wrapper">
                      <ul className="menu-dropdown-content">
                        <li>
                          <a href="#">Home Clean</a>
                        </li>
                        <li>
                          <a href="#">Home Collection</a>
                        </li>
                        <li>
                          <a href="#">Home Minimal</a>
                        </li>
                        <li>
                          <a href="#">Home Modern</a>
                        </li>
                        <li>
                          <a href="#">Home Parallax</a>
                        </li>
                        <li>
                          <a href="#">Home Strong</a>
                        </li>
                        <li>
                          <a href="#">Home Style</a>
                        </li>
                        <li>
                          <a href="#">Home Unique</a>
                        </li>
                        <li>
                          <a href="#">Home RTL</a>
                        </li>
                      </ul>
                    </div>
                  </li>

                  <li className="menu-list-item megamenu-wrapper">
                    <Link
                      to={"/shop"}
                      className={`menu-link ${pathname === "/shop" && "active"}`}
                    >
                      Shop
                      <i className="bi bi-chevron-down"></i>
                    </Link>
                    <div className="menu-dropdown-wrapper">
                      <div className="menu-dropdown-megamenu">
                        <div className="megamenu-links">
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">
                              Shop Style
                            </h3>
                            <ul className="megamenu-menu-list">
                              <li>
                                <a href="#">Shop Standard</a>
                              </li>
                              <li>
                                <a href="#">Shop Full</a>
                              </li>
                              <li>
                                <a href="#">Shop Only Categories</a>
                              </li>
                              <li>
                                <a href="#">Shop Image Categories</a>
                              </li>
                              <li>
                                <a href="#">Shop Sub Categories</a>
                              </li>
                              <li>
                                <a href="#">Shop List</a>
                              </li>
                              <li>
                                <a href="#">Hover Style 1</a>
                              </li>
                              <li>
                                <a href="#">Hover Style 2</a>
                              </li>
                              <li>
                                <a href="#">Hover Style 3</a>
                              </li>
                            </ul>
                          </div>
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">
                              Filter Layout
                            </h3>
                            <ul className="megamenu-menu-list">
                              <li>
                                <a href="#">Sidebar</a>
                              </li>
                              <li>
                                <a href="#">Filter Side Out</a>
                              </li>
                              <li>
                                <a href="#">Filter Dropdown</a>
                              </li>
                              <li>
                                <a href="#">Filter Drawer</a>
                              </li>
                            </ul>
                          </div>
                          <div className="megamenu-products">
                            <h3 className="megamenu-products-title">
                              Shop Loader
                            </h3>
                            <ul className="megamenu-menu-list">
                              <li>
                                <a href="#">Shop Pagination</a>
                              </li>
                              <li>
                                <a href="#">Shop Infinity</a>
                              </li>
                              <li>
                                <a href="#">Shop Load More</a>
                              </li>
                              <li>
                                <a href="#">Cart Modal</a>
                              </li>
                              <li>
                                <a href="#">Cart Drawer</a>
                              </li>
                              <li>
                                <a href="#">Cart Page</a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="megamenu-single">
                          <a href="#">
                            <img
                              src={`${import.meta.env.VITE_BASE_URL}/img/mega-menu.jpg`}
                              alt=""
                            />
                          </a>
                          <h3 className="megamenu-single-title">
                            JOIN THE LAYERING GANG
                          </h3>
                          <h4 className="megamenu-single-subtitle">
                            Suspendisse faucibus nunc et pellentesque
                          </h4>
                          <Link
                            to="/shop"
                            className="megamenu-single-button btn btn-sm"
                          >
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li className="menu-list-item">
                    <Link
                      to={"/blog"}
                      className={`menu-link ${pathname === "/blog" && "active"}`}
                    >
                      Blog
                    </Link>
                  </li>

                  <li className="menu-list-item">
                    <Link
                      to={"/contact"}
                      className={`menu-link ${pathname === "/contact" && "active"}`}
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </nav>
              <i
                className="bi-x-circle"
                id="close-sidebar"
                onClick={closeMenu}
              ></i>
            </div>

            {/* HEADER RIGHT */}
            <div className="header-right">
              <div className="header-right-links">
                {/* Giriş yapılmamışsa */}
                {!user && (
                  <Link
                    to={"/auth"}
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
                    <i className="bi bi-person" style={{ fontSize: 20 }} />
                    Giriş Yap
                  </Link>
                )}

                {/* Admin Paneli */}
                {roles.includes("Admin") && (
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

                {/* Avatar + isim → profil */}
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
                      size={32}
                      fontSize={12}
                    />
                    <div style={{ lineHeight: 1.3 }}>
                      <div
                        className="header-user-name"
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "#1a1a2e",
                        }}
                      >
                        {user.fullName}
                      </div>
                      <div
                        className="header-user-sub"
                        style={{ fontSize: 10, color: "#999" }}
                      >
                        Profilim
                      </div>
                    </div>
                  </Link>
                )}

                {/* Çıkış */}
                {user && (
                  <button
                    className="search-button"
                    onClick={handleLogout}
                    title="Çıkış Yap"
                    style={{ color: "#999" }}
                  >
                    <i
                      className="bi bi-box-arrow-right"
                      style={{ fontSize: 18 }}
                    />
                  </button>
                )}

                {/* Ayraç */}
                <div style={{ width: 1, height: 20, background: "#dee0ea" }} />

                {/* Arama */}
                <button
                  className="search-button"
                  onClick={() => setIsSearchShow(true)}
                  title="Ara"
                >
                  <i className="bi bi-search" />
                </button>

                {/* Sepet */}
                <div className="header-cart">
                  <Link to={"/cart"} className="header-cart-link">
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
