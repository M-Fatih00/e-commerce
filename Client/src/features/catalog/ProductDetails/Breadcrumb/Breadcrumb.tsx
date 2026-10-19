import { Link } from "react-router-dom";
import "./Breadcrumb.css";

interface BreadcrumbProps {
  categoryName?: string;
  productName?: string;
}

function Breadcrumb({ categoryName, productName }: BreadcrumbProps) {
  return (
    <div className="single-topbar">
      <nav className="breadcrumb" aria-label="Sayfa konumu">
        <ul>
          <li>
            <Link to="/">Anasayfa</Link>
          </li>

          <li>
            <Link to="/shop">{categoryName || "Mağaza"}</Link>
          </li>

          {productName && (
            <li>
              <a aria-current="page">{productName}</a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
}

export default Breadcrumb;