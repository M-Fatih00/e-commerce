import Loader from "../../../components/Loader";
import React, { useEffect } from "react";
import { Rate } from "antd";
import "./ProductReviews.css";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { getReviewsByProduct } from "./productReviewSlice";
import ReviewItem from "./ProductReviewItem";
import ReviewForm from "./ProductReviewForm";

interface ReviewPageProps {
  active: string;
  productId: number;
}

const ProductReviewPage: React.FC<ReviewPageProps> = ({ active, productId }) => {
  const dispatch = useAppDispatch();
  const { reviews, loading } = useAppSelector((state) => state.productReview);

  useEffect(() => {
    if (productId) dispatch(getReviewsByProduct(productId));
  }, [dispatch, productId]);

  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className={`tab-panel-reviews ${active}`}>
      <div className="rv-wrapper">
        <section>
          {loading ? (
            <div className="rv-loading">
              <Loader minHeight={160} />
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="rv-summary">
                <div className="rv-summary-score">
                  {average.toLocaleString("tr-TR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                </div>
                <div>
                  <Rate disabled allowHalf value={Math.round(average * 2) / 2} style={{ fontSize: 14 }} />
                  <div className="rv-muted">{reviews.length} değerlendirme</div>
                </div>
              </div>

              <ol className="rv-list">
                {reviews.map((review) => (
                  <ReviewItem key={review.id} reviewItem={review} />
                ))}
              </ol>
            </>
          ) : (
            <div className="rv-empty">
              <i className="bi bi-chat-square-text" />
              Bu ürün için henüz yorum yok. İlk yorumu siz yazın.
            </div>
          )}
        </section>

        <aside className="rv-form-section">
          <h3>Yorum Yaz</h3>
          <ReviewForm productId={productId} />
        </aside>
      </div>
    </div>
  );
};

export default ProductReviewPage;