import { useState } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header/Header";
import Footer from "./Footer/Footer";
import Search from "./Header/Search";

function MainLayout() {
  const [isSearchShow, setIsSearchShow] = useState<boolean>(false);

  return (
    <>
      <Header setIsSearchShow={setIsSearchShow} />
      <Search isSearchShow={isSearchShow} setIsSearchShow={setIsSearchShow} />
      <Outlet />
      <Footer />
    </>
  );
}

export default MainLayout;