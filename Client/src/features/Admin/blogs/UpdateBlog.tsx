import Loader from "../../../components/Loader";
import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import BlogForm from "./BlogForm";

type LoadedBlog = {
  title: string;
  content: string;
  image: string | null;
};

const UpdateBlog: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loaded, setLoaded] = useState<LoadedBlog | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    requests.Blogs.getById(Number(id))
      .then((data) => setLoaded({ title: data.title, content: data.description ?? "", image: data.img ?? null }))
      .catch(() => undefined);
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Blogs.update(Number(id), formData);
      message.success("Blog güncellendi.");
      navigate("/admin/blogs");
    } catch (error) {
      showFormError(error, "Blog güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Blog Güncelle</h2>
        <Button onClick={() => navigate("/admin/blogs")}>← Geri</Button>
      </div>

      {loaded ? (
        <BlogForm
          mode="update"
          initialTitle={loaded.title}
          initialContent={loaded.content}
          currentImage={loaded.image}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      ) : (
        <div style={{ display: "grid", placeItems: "center", minHeight: 300 }}>
          <Loader />
        </div>
      )}
    </div>
  );
};

export default UpdateBlog;