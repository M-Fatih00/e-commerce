import React, { useState } from "react";
import { Button, Input, Modal, Rate, Tooltip, message } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import { deleteReview, updateReview, ReviewError } from "./productReviewSlice";
import { IProductReview } from "../../../model/IProductReview";
import UserAvatar from "../../Auth/UserAvatar";

const MAX_LENGTH = 1000;

const showError = (error: unknown) => {
  const e = error as ReviewError;
  if (e?.status === 400) message.error(e.message);
};

interface ReviewItemProps {
  reviewItem: IProductReview;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ reviewItem }) => {
  const { id, text, rating, createdDate, authorName, authorAvatar, isMine } =
    reviewItem;
  const dispatch = useAppDispatch();
  const isAdmin =
    useAppSelector((state) => state.auth.user?.roles?.includes("Admin")) ??
    false;
  const [modal, contextHolder] = Modal.useModal();

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const [editRating, setEditRating] = useState(rating);
  const [saving, setSaving] = useState(false);

  const canDelete = isMine || isAdmin;
  const formattedDate = new Date(createdDate).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDelete = () => {
    modal.confirm({
      title: "Yorumu sil",
      content: isMine
        ? "Yorumunuz kalıcı olarak silinecek."
        : "Bu kullanıcının yorumu kalıcı olarak silinecek.",
      okText: "Sil",
      okButtonProps: { danger: true },
      cancelText: "Vazgeç",
      onOk: async () => {
        try {
          await dispatch(deleteReview(id)).unwrap();
          message.success("Yorum silindi.");
        } catch (error) {
          showError(error);
        }
      },
    });
  };

  const handleUpdate = async () => {
    if (!editRating) {
      message.warning("Lütfen bir puan seçin.");
      return;
    }
    if (editText.trim().length < 3) {
      message.warning("Yorum en az 3 karakter olmalıdır.");
      return;
    }

    setSaving(true);
    try {
      await dispatch(
        updateReview({
          id,
          data: { text: editText.trim(), rating: editRating },
        }),
      ).unwrap();
      message.success("Yorum güncellendi.");
      setEditing(false);
    } catch (error) {
      showError(error);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setEditText(text);
    setEditRating(rating);
  };

  return (
    <li className="rv-card animate-fade-in">
      {contextHolder}

      <UserAvatar
        fullName={authorName}
        avatar={authorAvatar}
        size={36}
        fontSize={13}
      />

      <div className="rv-body">
        <div className="rv-meta">
          <strong>{authorName}</strong>
          {isMine && <span className="rv-badge">Siz</span>}
          {!editing && <Rate disabled value={rating} className="rv-stars" />}
          <span className="rv-dot">·</span>
          <time className="rv-muted" dateTime={createdDate}>
            {formattedDate}
          </time>
        </div>

        {editing ? (
          <div className="rv-edit">
            <Rate value={editRating} onChange={setEditRating} />
            <Input.TextArea
              rows={4}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              maxLength={MAX_LENGTH}
              showCount
            />
            <div className="rv-edit-actions">
              <Button onClick={cancelEdit} disabled={saving}>
                İptal
              </Button>
              <Button type="primary" onClick={handleUpdate} loading={saving}>
                Kaydet
              </Button>
            </div>
          </div>
        ) : (
          <p className="rv-text">{text}</p>
        )}
      </div>

      {canDelete && !editing && (
        <div className="rv-actions">
          {isMine && (
            <Tooltip title="Düzenle">
              <Button
                type="text"
                className="rv-action-btn"
                icon={<EditOutlined />}
                onClick={() => setEditing(true)}
                aria-label="Yorumu düzenle"
              />
            </Tooltip>
          )}
          <Tooltip title="Sil">
            <Button
              type="text"
              danger
              className="rv-action-btn"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              aria-label="Yorumu sil"
            />
          </Tooltip>
        </div>
      )}
    </li>
  );
};

export default ReviewItem;
