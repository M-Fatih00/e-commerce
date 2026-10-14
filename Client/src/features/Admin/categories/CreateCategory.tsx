import React, { useState } from "react";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import CategoryForm from "./CategoryForm";

const CreateCategory: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Categories.create(formData);
      message.success("Kategori oluşturuldu.");
      navigate("/admin/categories");
    } catch (error) {
      showFormError(error, "Kategori oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Kategori</h2>
        <Button onClick={() => navigate("/admin/categories")}>← Geri</Button>
      </div>
      <CategoryForm mode="create" submitting={submitting} onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateCategory;