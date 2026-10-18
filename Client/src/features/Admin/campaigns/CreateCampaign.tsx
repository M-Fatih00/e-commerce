import React, { useEffect, useState } from "react";
import { Alert, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import requests from "../../../api/requests";
import { showFormError } from "../../../utils/errors";
import CampaignForm, { CampaignFormValues } from "./CampaignForm";

const MAX_CAMPAIGNS = 4;
const CREATE_DEFAULTS: Partial<CampaignFormValues> = { index: 0 };

const CreateCampaign: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [maxReached, setMaxReached] = useState(false);

  useEffect(() => {
    requests.Campaigns.list()
      .then((data: unknown[]) => setMaxReached(data.length >= MAX_CAMPAIGNS))
      .catch(() => undefined);
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setSubmitting(true);
    try {
      await requests.Campaigns.create(formData);
      message.success("Kampanya oluşturuldu.");
      navigate("/admin/campaigns");
    } catch (error) {
      showFormError(error, "Kampanya oluşturulamadı.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 640 }} className="animate-fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Yeni Kampanya</h2>
        <Button onClick={() => navigate("/admin/campaigns")}>← Geri</Button>
      </div>

      {maxReached && (
        <Alert
          type="warning"
          showIcon
          title={`En fazla ${MAX_CAMPAIGNS} kampanya eklenebilir. Yeni kampanya için mevcut bir kampanyayı silin.`}
          style={{ marginBottom: 16 }}
        />
      )}

      <CampaignForm
        mode="create"
        initialValues={CREATE_DEFAULTS}
        disabled={maxReached}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateCampaign;