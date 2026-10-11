import { useState } from "react";
import "./Tabs.css";
import ProductReviewPage from "../../../Reviews/ProductReview/ProductReviewPage";
import { IProductDetail } from "../../../../model/IProductDetail";

type TabKey = "desc" | "info" | "reviews";

interface TabsProps {
  singleProduct: IProductDetail;
}

function Tabs({ singleProduct }: TabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("desc");

  const colors = singleProduct.colors ?? [];
  const sizes = singleProduct.sizes ?? [];
  const hasInfo = colors.length > 0 || sizes.length > 0;
  const reviewCount = singleProduct.reviewCount ?? 0;

  const tabs: { key: TabKey; label: string }[] = [
    { key: "desc", label: "Açıklama" },
    ...(hasInfo ? [{ key: "info" as const, label: "Ek Bilgiler" }] : []),
    { key: "reviews", label: reviewCount > 0 ? `Yorumlar (${reviewCount})` : "Yorumlar" },
  ];

  return (
    <div className="single-tabs">
      <ul className="tab-list" role="tablist">
        {tabs.map((tab) => (
          <li key={tab.key}>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>

      <div className="tab-panel">
        <div className={`tab-panel-descriptions content ${activeTab === "desc" ? "active" : ""}`}>
          <p className="tab-description-text">
            {singleProduct.description || "Bu ürün için açıklama bulunmuyor."}
          </p>
        </div>

        {hasInfo && (
          <div className={`tab-panel-information content ${activeTab === "info" ? "active" : ""}`}>
            <h3>Ek Bilgiler</h3>
            <table>
              <tbody>
                {colors.length > 0 && (
                  <tr>
                    <th>Renk</th>
                    <td>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {colors.map((color) => (
                          <span
                            key={color}
                            title={color}
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
                    </td>
                  </tr>
                )}

                {sizes.length > 0 && (
                  <tr>
                    <th>Beden</th>
                    <td>{sizes.map((item) => item.size.toUpperCase()).join(", ")}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <ProductReviewPage
          active={activeTab === "reviews" ? "content active" : "content"}
          productId={singleProduct.id}
        />
      </div>
    </div>
  );
}

export default Tabs;