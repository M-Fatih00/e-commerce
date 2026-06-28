import { Link } from "react-router-dom";
import { getImageUrl } from "../../../utils/image";
import "./CampaignSingle.css";

function CampaignSingle() {
  const campaignData = {
    image: "single-campaign.png",
  };
  const bgImageUrl = getImageUrl(campaignData.image);

  return (
    <section
      className="campaign-single"
      style={{
        backgroundImage: `url(${bgImageUrl})`,
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container">
        <div className="campaign-wrapper">
          <h2>New Season Sale</h2>
          <strong>40% OFF</strong>
          <span></span>
          <Link to="/shop" className="btn btn-lg">
            SHOP NOW
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CampaignSingle;
