import Loader from "../../../components/Loader";
import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import CategoryForm from "./CategoryForm";

type LoadedCategory = {
  name: string;
  image: string | null;
};

const UpdateCategory: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loaded, setLoaded] = useState<LoadedCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    requests.Categories.details(Number(id))
      .then((data) => setLoaded({ name: data.name, image: data.imageUrl ?? null }))
      .catch(() => undefined);
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Categories.update(Number(id), formData);
      message.success("Kategori güncellendi.");
      navigate("/admin/categories");
    } catch (error) {
      showFormError(error, "Kategori güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 520 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Kategori Güncelle</h2>
        <Button onClick={() => navigate("/admin/categories")}>← Geri</Button>
      </div>

      {loaded ? (
        <CategoryForm
          mode="update"
          initialName={loaded.name}
          currentImage={loaded.image}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <div style={{ display: "grid", placeItems: "center", minHeight: 200 }}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default UpdateCategory;