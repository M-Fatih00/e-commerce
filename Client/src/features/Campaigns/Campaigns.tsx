import { useEffect, useState } from "react";
import CampaignItem from "./CampaignItem";
import requests from "../../api/requests";
import "./Compaigns.css";
import { ICampaign } from "../../model/ICampaign";

const SKELETON_COUNT = 4;

const getSizeClass = (index: number) => {
  if (index < 2) return "half";
  if (index === 2) return "large";
  return "small";
};

function CampaignItemSkeleton({ className }: { className: string }) {
  return (
    <div className={`campaign-item campaign-item-skeleton ${className}`} aria-hidden="true">
      <span className="skeleton-block campaign-skeleton-title" />
      <span className="skeleton-block campaign-skeleton-desc" />
      <span className="skeleton-block campaign-skeleton-button" />
    </div>
  );
}

function Campaigns() {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requests.Campaigns.list()
      .then(setCampaigns)
      .catch(() => setCampaigns([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && campaigns.length === 0) return null;

  return (
    <section className="campaigns">
      <div className="container">
        <div className="campaigns-wrapper" aria-busy={loading}>
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <CampaignItemSkeleton key={i} className={getSizeClass(i)} />
              ))
            : campaigns.map((item, index) => (
                <CampaignItem
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  imageUrl={item.imageUrl}
                  categoryId={item.categoryId}
                  className={getSizeClass(index)}
                />
              ))}
        </div>
      </div>
    </section>
  );
}

export default Campaigns;