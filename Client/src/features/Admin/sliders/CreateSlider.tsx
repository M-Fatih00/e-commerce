import React, { useState } from "react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import SliderForm from "./SliderForm";

const CreateSlider: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Sliders.create(formData);
      message.success("Slider eklendi.");
      navigate("/admin/sliders");
    } catch (error) {
      showFormError(error, "Slider eklenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>Yeni Slider</h2>
      <SliderForm mode="create" submitting={submitting} onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateSlider;