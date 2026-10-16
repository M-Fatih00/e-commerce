import React, { useState } from "react";
import { Input, Rate, message } from "antd";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { createReview, ReviewError } from "./productReviewSlice";

const MAX_LENGTH = 1000;

interface ReviewFormProps {
  productId: number;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const alreadyReviewed = useAppSelector((state) => state.productReview.reviews.some((r) => r.isMine));

  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <p className="rv-hint">
        Yorum yapmak için <Link to="/auth">giriş yapın</Link>.
      </p>
    );
  }

  if (alreadyReviewed) {
    return <p className="rv-hint">Bu ürüne yorum yaptınız. Yorumunuzu listeden düzenleyebilirsiniz.</p>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!rating) {
      message.warning("Lütfen bir puan seçin.");
      return;
    }
    if (text.trim().length < 3) {
      message.warning("Yorum en az 3 karakter olmalıdır.");
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(createReview({ productId, text: text.trim(), rating })).unwrap();
      message.success("Yorumunuz eklendi.");
      setText("");
      setRating(0);
    } catch (error) {
      const err = error as ReviewError;
      if (err?.status === 400) message.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="rv-form" onSubmit={handleSubmit}>
      <span className="rv-label">Puanınız</span>
      <Rate value={rating} onChange={setRating} />

      <label htmlFor="review-text" className="rv-label">
        Yorumunuz
      </label>
      <Input.TextArea
        id="review-text"
        rows={5}
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX_LENGTH}
        showCount
        placeholder="Ürün hakkındaki düşüncelerinizi ya da sorunuzu yazın..."
      />

      <button type="submit" className="btn rv-submit" disabled={submitting}>
        {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
      </button>
    </form>
  );
};

export default ReviewForm;