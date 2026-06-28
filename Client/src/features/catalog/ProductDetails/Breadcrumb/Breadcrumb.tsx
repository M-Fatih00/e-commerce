import "./Breadcrumb.css";

interface BreadcrumbProps {
  categoryName?: string;
  productName?: string;
}

function Breadcrumb({ categoryName = "Category", productName }: BreadcrumbProps) {
  return (
    <div className="single-topbar">
      <nav className="breadcrumb">
        <ul>
          <li>
            <a href="/">Home</a>
          </li>

          <li>
            <a href="#">{categoryName}</a>
          </li>

          <li>
            <a href="#">{productName}</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Breadcrumb;