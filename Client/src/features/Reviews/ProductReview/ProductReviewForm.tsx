import React, { useState } from "react";
import { message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { createReview } from "./productReviewSlice";
import { AppDispatch, RootState } from "../../../store/store";

interface ReviewFormProps {
  productId: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>("");
  const dispatch = useDispatch<AppDispatch>();

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleRatingChange = (e: React.MouseEvent<HTMLAnchorElement>, newRating: number): void => {
    e.preventDefault();
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (rating === 0) {
      message.warning("Lütfen bir puan seçiniz!");
      return;
    }

    if (!isAuthenticated || !user) {
      message.error("Yorum yapmak için giriş yapmalısınız.");
      return;
    }

    try {
      await dispatch(createReview({ productId, text: review, rating })).unwrap();
      message.success("Yorum başarıyla eklendi.");
      setReview("");
      setRating(0);
    } catch (error: any) {
      message.error(
        typeof error === "string"
          ? error
          : error?.message || "Yorum eklenirken bir hata oluştu."
      );
    }
  };

  return (
    <>
    <form className="comment-form" onSubmit={handleSubmit}>
      <div className="comment-form-rating">
        <label>
          Your rating <span className="required">*</span>
        </label>
        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <a
              key={star}
              href="#"
              className={`star ${rating === star ? "active" : ""}`}
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => handleRatingChange(e, star)}
            >
              {Array.from({ length: star }).map((_, i) => (
                <i key={i} className="bi bi-star-fill"></i>
              ))}
            </a>
          ))}
        </div>
      </div>

      <div className="comment-form-comment form-comment">
        <label htmlFor="comment">
          Your review <span className="required">*</span>
        </label>
        <textarea
          id="comment"
          cols={50}
          rows={10}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReview(e.target.value)}
          value={review}
          required
        />
      </div>

      <div className="form-submit">
        <input type="submit" className="btn submit" value="Submit" />
      </div>
    </form>
    </>
  )
};

export default ReviewForm;