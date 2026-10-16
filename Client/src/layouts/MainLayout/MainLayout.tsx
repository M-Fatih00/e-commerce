import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Search from "./Header/Search";

function MainLayout() {
  const [isSearchShow, setIsSearchShow] = useState<boolean>(false);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Header setIsSearchShow={setIsSearchShow} />
      <Search isSearchShow={isSearchShow} setIsSearchShow={setIsSearchShow} />
      <main key={pathname} className="page-transition">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default MainLayout;