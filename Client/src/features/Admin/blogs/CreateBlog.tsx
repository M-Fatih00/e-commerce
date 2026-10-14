import React, { useState } from "react";
import { Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import BlogForm from "./BlogForm";

const CreateBlog: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Blogs.create(formData);
      message.success("Blog oluşturuldu.");
      navigate("/admin/blogs");
    } catch (error) {
      showFormError(error, "Blog oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Blog</h2>
        <Button onClick={() => navigate("/admin/blogs")}>← Geri</Button>
      </div>
      <BlogForm mode="create" submitting={submitting} onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateBlog;