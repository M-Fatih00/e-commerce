import React, { useState } from "react";
import "./Tabs.css";
import ProductReviewPage from "../../../Reviews/ProductReview/ProductReviewPage";
import { IProductDetail } from "../../../../model/IProductDetail";

interface TabsProps {
  singleProduct: IProductDetail;
  setSingleProduct?: React.Dispatch<
    React.SetStateAction<IProductDetail | null>
  >;
}

function Tabs({ singleProduct }: TabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "info" | "reviews">(
    "desc",
  );

  const handleTabClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    tab: "desc" | "info" | "reviews",
  ) => {
    e.preventDefault();
    setActiveTab(tab);
  };

  return (
    <div className="single-tabs">
      <ul className="tab-list">
        <li>
          <a
            href="#"
            className={`tab-button ${activeTab === "desc" ? "active" : ""}`}
            onClick={(e) => handleTabClick(e, "desc")}
          >
            Description
          </a>
        </li>

        <li>
          <a
            href="#"
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={(e) => handleTabClick(e, "info")}
          >
            Additional information
          </a>
        </li>

        <li>
          <a
            href="#"
            className={`tab-button ${activeTab === "reviews" ? "active" : ""}`}
            onClick={(e) => handleTabClick(e, "reviews")}
          >
            Reviews
          </a>
        </li>
      </ul>

      <div className="tab-panel">
        {/* DESCRIPTION */}
        <div
          className={`tab-panel-descriptions content ${
            activeTab === "desc" ? "active" : ""
          }`}
        >
          <div
            className="product-description"
            dangerouslySetInnerHTML={{
              __html: singleProduct.description,
            }}
          />
        </div>

        {/* INFO */}
        <div
          className={`tab-panel-information content ${
            activeTab === "info" ? "active" : ""
          }`}
        >
          <h3>Additional information</h3>

          <table>
            <tbody>
              <tr>
                <th>Color</th>
                <td>
                  <div>
                    {singleProduct.colors &&
                      singleProduct.colors.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          {singleProduct.colors.map((color, index) => (
                            <span
                              key={index}
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: color,
                                border: "1px solid #ddd",
                                display: "inline-block",
                              }}
                            />
                          ))}
                        </div>
                      )}
                  </div>
                </td>
              </tr>

              <tr>
                <th>Size</th>
                <td>
                  <p>
                    {singleProduct.sizes?.map((item, index) => (
                      <span key={index}>
                        {item.size.toUpperCase()}
                        {index < singleProduct.sizes.length - 1 && ", "}
                      </span>
                    ))}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* REVIEWS */}
        <ProductReviewPage
          active={activeTab === "reviews" ? "content active" : "content"}
          // singleProduct={singleProduct}
          productId={singleProduct?.id}
        />
      </div>
    </div>
  );
}

export default Tabs;
