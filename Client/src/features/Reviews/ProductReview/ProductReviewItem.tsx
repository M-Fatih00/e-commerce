import React, { useState } from "react";
import { message, Modal, Input, Rate } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import { deleteReview, updateReview } from "./productReviewSlice";

interface ReviewItemProps {
  reviewItem: {
    id: number;
    text: string;
    rating: number;
    createdDate?: string;
    userName: string;
    userId: string;
  };
}

const ReviewItem: React.FC<ReviewItemProps> = ({ reviewItem }) => {
  const { id, text, createdDate, rating, userName, userId } = reviewItem;
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editRating, setEditRating] = useState(rating);

  // Kendi yorumu mu, yoksa admin mi?
  const isAdmin = user?.roles?.includes("Admin");
  const isOwner = user?.id === userId;
  const canModify = isOwner || isAdmin;

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = createdDate
    ? new Date(createdDate).toLocaleDateString("tr-TR", options)
    : "";

  const handleDelete = () => {
    Modal.confirm({
      title: "Yorumu sil",
      content: "Bu yorumu silmek istediğinize emin misiniz?",
      okText: "Sil",
      okType: "danger",
      cancelText: "Vazgeç",
      onOk: async () => {
        try {
          await dispatch(deleteReview(id)).unwrap();
          message.success("Yorum silindi.");
        } catch (error: any) {
          message.error(
            typeof error === "string" ? error : error?.message || "Silme başarısız."
          );
        }
      },
    });
  };

  const handleUpdate = async () => {
    if (editRating === 0) {
      message.warning("Lütfen bir puan seçiniz.");
      return;
    }
    try {
      await dispatch(updateReview({ id, data: { text: editText, rating: editRating } })).unwrap();
      message.success("Yorum güncellendi.");
      setEditing(false);
    } catch (error: any) {
      message.error(
        typeof error === "string" ? error : error?.message || "Güncelleme başarısız."
      );
    }
  };

  return (
    <li className="comment-item">
      <div className="comment-avatar">
        <img
          src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
          alt={userName}
          width={60}
        />
      </div>

      <div className="comment-text">
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Rate value={editRating} onChange={setEditRating} />
            <Input.TextArea
              rows={3}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" type="button" onClick={handleUpdate}>Kaydet</button>
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditText(text);
                  setEditRating(rating);
                }}
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <>
            <ul className="comment-star">
              {Array.from({ length: rating }).map((_, index) => (
                <li key={index}>
                  <i className="bi bi-star-fill"></i>
                </li>
              ))}
            </ul>

            <div className="comment-meta">
              <strong>{userName}</strong>
              <span> - </span>
              <time>{formattedDate}</time>
            </div>

            <div className="comment-description">
              <p>{text}</p>
            </div>

            {canModify && (
              <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  style={{ background: "none", border: "none", color: "#1677ff", cursor: "pointer", padding: 0, fontSize: 13 }}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{ background: "none", border: "none", color: "#ff4d4f", cursor: "pointer", padding: 0, fontSize: 13 }}
                >
                  Sil
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default ReviewItem;