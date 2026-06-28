import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import Breadcrumb from "./Breadcrumb/Breadcrumb";
import Gallery from "./Gallery/Gallery";
import Info from "./Info/Info";
import Tabs from "./Tabs/Tabs";
import { fetchProductDetails } from "./productDetailsSlice";
import "./ProductDetails.css";
import { Spin } from "antd";

function ProductDetailsPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const { product, loading } = useAppSelector((state) => state.productDetails);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetails(Number(id)));
    }
  }, [id, dispatch]);

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <Spin size="large" />
      </div>
    );
  if (!product) return <div>Product not found</div>;

  return (
    <section className="single-product">
      <div className="container">
        <div className="single-product-wrapper">
          <Breadcrumb
            categoryName={product.categoryName}
            productName={product.name}
          />

          <div className="single-content">
            <main className="site-main">
              <Gallery singleProduct={product} />
              <Info singleProduct={product} />
            </main>
          </div>

          <Tabs singleProduct={product} />
        </div>
      </div>
    </section>
  );
}

export default ProductDetailsPage;
