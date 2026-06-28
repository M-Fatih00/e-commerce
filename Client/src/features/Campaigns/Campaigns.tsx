import { useEffect, useState } from "react";
import CampaignItem from "./CampaignItem";
import requests from "../../api/requests";
import "./Compaigns.css";
import { ICampaign } from "../../model/ICampaign";

function Campaigns() {
  const [campaigns, setCampaigns] = useState<ICampaign[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await requests.Campaigns.list();
        setCampaigns(data);
      } catch (error) {
        console.error("Campaign çekilemedi", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section className="campaigns">
      <div className="container">
        <div className="campaigns-wrapper">
          {campaigns.map((item, index) => {
            let sizeClass = "";

            if (index < 2) sizeClass = "half";
            else if (index === 2) sizeClass = "large";
            else sizeClass = "small";

            return (
              <CampaignItem
                key={item.id}
                title={item.title}
                description={item.description}
                imageUrl={item.imageUrl}
                categoryId={item.categoryId}
                className={sizeClass}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Campaigns;
