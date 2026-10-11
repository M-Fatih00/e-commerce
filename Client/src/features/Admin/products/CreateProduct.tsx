import React, { useState } from "react";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import ProductForm, { ProductFormValues } from "./ProductForm";

const CREATE_DEFAULTS: Partial<ProductFormValues> = { discount: 0 };

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Catalog.create(formData);
      message.success("Ürün oluşturuldu.");
      navigate("/admin/products");
    } catch (error) {
      showFormError(error, "Ürün oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 760 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Ürün</h2>
        <Button onClick={() => navigate("/admin/products")}>← Geri</Button>
      </div>
      <ProductForm mode="create" initialValues={CREATE_DEFAULTS} submitting={submitting} onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateProduct;