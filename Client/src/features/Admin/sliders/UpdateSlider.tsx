import React, { useEffect, useMemo, useState } from "react";
import { Empty, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import requests from "../../../api/requests";
import Loader from "../../../components/Loader";
import { showFormError } from "../../../utils/errors";
import SliderForm, { ISlider, SliderFormValues } from "./SliderForm";

const UpdateSlider: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slider, setSlider] = useState<ISlider | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const sliderId = Number(id);
    if (!Number.isInteger(sliderId)) {
      setLoading(false);
      return;
    }

    requests.Sliders.details(sliderId)
      .then(setSlider)
      .catch((error) => showFormError(error, "Slider getirilemedi."))
      .finally(() => setLoading(false));
  }, [id]);

  const initialValues = useMemo<SliderFormValues | undefined>(
    () =>
      slider
        ? {
            baslik: slider.baslik ?? "",
            altBaslik: slider.altBaslik ?? "",
            butonMetni: slider.butonMetni ?? "",
            butonLinki: slider.butonLinki ?? "",
            aktif: slider.aktif,
          }
        : undefined,
    [slider],
  );

  const handleSubmit = async (formData: FormData) => {
    if (!slider) return;
    setSubmitting(true);
    try {
      await requests.Sliders.update(slider.id, formData);
      message.success("Slider güncellendi.");
      navigate("/admin/sliders");
    } catch (error) {
      showFormError(error, "Slider güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader minHeight={400} />;
  if (!slider) return <Empty description="Slider bulunamadı." />;

  return (
    <div className="animate-fade-in">
      <h2 style={{ marginTop: 0, marginBottom: 20 }}>Slider'ı Güncelle</h2>
      <SliderForm
        mode="update"
        initialValues={initialValues}
        currentImage={slider.resim}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default UpdateSlider;