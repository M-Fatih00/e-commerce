import Loader from "../../../components/Loader";
import React, { useEffect, useState } from "react";
import { Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import { ICampaign } from "../../../model/ICampaign";
import CampaignForm, { CampaignFormValues } from "./CampaignForm";

type LoadedCampaign = {
  values: Partial<CampaignFormValues>;
  image: string | null;
};

const UpdateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loaded, setLoaded] = useState<LoadedCampaign | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    requests.Campaigns.getById(Number(id))
      .then((c: ICampaign) =>
        setLoaded({
          values: { title: c.title, description: c.description ?? "", categoryId: c.categoryId, index: c.index },
          image: c.imageUrl ?? null,
        }),
      )
      .catch(() => undefined);
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Campaigns.update(Number(id), formData);
      message.success("Kampanya güncellendi.");
      navigate("/admin/campaigns");
    } catch (error) {
      showFormError(error, "Kampanya güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Kampanya Güncelle</h2>
        <Button onClick={() => navigate("/admin/campaigns")}>← Geri</Button>
      </div>

      {loaded ? (
        <CampaignForm
          mode="update"
          initialValues={loaded.values}
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

export default UpdateCampaign;