import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./ProductReviews.css";
import { AppDispatch, RootState } from "../../../store/store";
import { getReviewsByProduct } from "./productReviewSlice";
import ReviewItem from "./ProductReviewItem";
import ReviewForm from "./ProductReviewForm";

interface ReviewPageProps {
  active: string;
  productId: number;
}

const ProductReviewPage: React.FC<ReviewPageProps> = ({
  active,
  productId,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { reviews, loading } = useSelector(
    (state: RootState) => state.productReview
  );

  useEffect(() => {
    if (productId) {
      dispatch(getReviewsByProduct(productId));
    }
  }, [dispatch, productId]);

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className={`tab-panel-reviews ${active}`}>
      {reviews.length > 0 ? (
        <>
          <h3>{reviews.length} reviews for this product</h3>

          <div className="comments" style={{ maxHeight: "500px", overflowY: "auto", paddingRight: "8px" }}>
            <ol className="comment-list">
              {reviews.map((review) => (
                <ReviewItem key={review.id} reviewItem={review} />
              ))}
            </ol>
          </div>
        </>
      ) : (
        <h3>Hiç yorum yok...</h3>
      )}

      <div className="review-form-wrapper">
        <h2>Add a review</h2>

        <ReviewForm productId={productId} />
      </div>
    </div>
  );
};

export default ProductReviewPage;