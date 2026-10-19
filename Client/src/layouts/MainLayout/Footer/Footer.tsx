import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { message } from "antd";
import "./Footer.css";
import Policy from "../Policy/Policy";
import Logo from "../../../components/Logo";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { fetchCategories, selectAllCategories } from "../../../features/Categories/categorySlice";

type SectionKey = "information" | "account" | "shop" | "categories";

type NavLinkItem = {
  label: string;
  to?: string;
};

const INFORMATION_LINKS: NavLinkItem[] = [
  { label: "Hakkımızda" },
  { label: "Gizlilik Politikası" },
  { label: "İade Politikası" },
  { label: "Kargo Politikası" },
  { label: "Toptan Satış" },
];

const ACCOUNT_LINKS: NavLinkItem[] = [
  { label: "Hesabım", to: "/profile" },
  { label: "Siparişlerim", to: "/order" },
  { label: "Favorilerim" },
  { label: "Sepetim", to: "/cart" },
  { label: "Sipariş Takibi", to: "/order" },
];

const SHOP_LINKS: NavLinkItem[] = [
  { label: "Mağaza", to: "/shop" },
  { label: "Çok Satanlar", to: "/shop" },
  { label: "İndirimli Ürünler", to: "/shop" },
  { label: "Yeni Ürünler", to: "/shop" },
  { label: "İş Ortaklığı" },
];

const MAX_CATEGORIES = 5;

function renderLink(item: NavLinkItem) {
  return (
    <li key={item.label}>
      {item.to ? <Link to={item.to}>{item.label}</Link> : <a href="#">{item.label}</a>}
    </li>
  );
}

function Footer() {
  const Base_URL = import.meta.env.VITE_BASE_URL;
  const year = new Date().getFullYear();

  const dispatch = useAppDispatch();
  const categories = useAppSelector(selectAllCategories);
  const { isLoaded: categoriesLoaded } = useAppSelector((state) => state.category);

  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    information: false,
    account: false,
    shop: false,
    categories: false,
  });

  useEffect(() => {
    if (!categoriesLoaded) dispatch(fetchCategories());
  }, [categoriesLoaded, dispatch]);

  const toggleSection = (key: SectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleKey = (e: React.KeyboardEvent, key: SectionKey) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSection(key);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    message.info("Bülten aboneliği yakında aktif olacak.");
  };

  const renderSection = (key: SectionKey, title: string, items: React.ReactNode) => (
    <div className={`widget-nav-menu ${openSections[key] ? "open" : ""}`}>
      <h4
        role="button"
        tabIndex={0}
        aria-expanded={openSections[key]}
        onClick={() => toggleSection(key)}
        onKeyDown={(e) => handleToggleKey(e, key)}
      >
        {title}
        <i className="bi bi-chevron-down accordion-icon" aria-hidden="true"></i>
      </h4>
      <ul className="menu-list">{items}</ul>
    </div>
  );

  return (
    <React.Fragment>
      <Policy />
      <footer className="footer">
        <div className="subscribe-row">
          <div className="container">
            <div className="footer-row-wrapper">
              <div className="footer-subscribe-wrapper">
                <div className="footer-subscribe">
                  <div className="footer-subscribe-top">
                    <h3 className="subscribe-title">
                      Yeni ürünler, kampanyalar ve daha fazlası için bültenimize abone ol.
                    </h3>
                    <p className="subscribe-desc">
                      İlk siparişinde kullanabileceğin indirim kodunu e-postana gönderelim.
                    </p>
                  </div>
                  <div className="footer-subscribe-bottom">
                    <form onSubmit={handleSubscribe}>
                      <input
                        type="email"
                        placeholder="E-posta adresini gir"
                        aria-label="E-posta adresi"
                        autoComplete="email"
                      />
                      <button type="submit" className="btn">
                        Abone Ol
                      </button>
                    </form>
                    <p className="privacy-text">
                      Abone olarak <a href="#">Kullanım Koşulları ile Gizlilik ve Çerez Politikası</a>'nı
                      kabul etmiş olursun.
                    </p>
                  </div>
                </div>
              </div>
              <div className="footer-contact-wrapper">
                <div className="footer-contact-top">
                  <h3 className="contact-title">
                    Yardıma mı ihtiyacın var? <br />
                    (+90) 123 456 78 90
                  </h3>
                  <p className="contact-desc">Hafta içi 08:00 – 19:00 arası ulaşabilirsin.</p>
                </div>
                <div className="footer-contact-bottom">
                  <div className="download-app">
                    <a href="#">
                      <img src={`${Base_URL}/img/footer/app-store.png`} alt="App Store'dan indir" />
                    </a>
                    <a href="#">
                      <img src={`${Base_URL}/img/footer/google-play.png`} alt="Google Play'den indir" />
                    </a>
                  </div>
                  <p className="privacy-text">
                    <strong>Mobil Uygulama:</strong> Siparişlerini takip et, favorilerini kaydet ve
                    ödeme bilgilerini güvenle sakla.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="widgets-row">
          <div className="container">
            <div className="footer-widgets">
              <div className="brand-info">
                <div className="footer-logo">
                  <Link to="/" aria-label="Anasayfa">
                    <Logo height={44} />
                  </Link>
                </div>
                <div className="footer-desc">
                  <p>
                    Sezonun öne çıkan parçalarını, zamansız klasiklerle bir araya getiren online
                    moda ve giyim mağazası.
                  </p>
                </div>
                <div className="footer-contact">
                  <p>
                    <a href="tel:+901234567890">(+90) 123 456 78 90</a> –{" "}
                    <a href="mailto:info@example.com">info@example.com</a>
                  </p>
                </div>
              </div>

              {renderSection("information", "Bilgi", INFORMATION_LINKS.map(renderLink))}
              {renderSection("account", "Hesabım", ACCOUNT_LINKS.map(renderLink))}
              {renderSection("shop", "Mağaza", SHOP_LINKS.map(renderLink))}
              {renderSection(
                "categories",
                "Kategoriler",
                categories.slice(0, MAX_CATEGORIES).map((category) => (
                  <li key={category.id}>
                    <Link to={`/shop?category=${category.id}`}>{category.name}</Link>
                  </li>
                )),
              )}
            </div>
          </div>
        </div>

        <div className="copyright-row">
          <div className="container">
            <div className="footer-copyright">
              <div className="site-copyright">
                <p>
                  © {year} E-Commerce. Tüm hakları saklıdır. Geliştirici: Mehmet Fatih Canıbek.
                </p>
              </div>
              <img src={`${Base_URL}/img/footer/cards.png`} alt="Kabul edilen ödeme yöntemleri" />
              <div className="footer-menu">
                <ul className="footer-menu-list">
                  <li className="list-item">
                    <a href="#">Gizlilik Politikası</a>
                  </li>
                  <li className="list-item">
                    <a href="#">Kullanım Koşulları</a>
                  </li>
                  <li className="list-item">
                    <a href="#">İade Politikası</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
}

export default Footer;