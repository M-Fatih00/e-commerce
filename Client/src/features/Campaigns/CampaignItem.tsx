import { Link } from "react-router-dom";
import "./CompaignItem.css";

type Props = {
  title: string;
  description: string;
  imageUrl: string;
  className?: string;
  categoryId: number;
};

function CampaignItem({
  title,
  description,
  imageUrl,
  className,
  categoryId,
}: Props) {
  const baseUrl = import.meta.env.VITE_BASE_URL;

  const imgUrl = imageUrl ? `${baseUrl}/img/${imageUrl}` : "";

  return (
    <div
      className={`campaign-item ${className}`}
      style={{ backgroundImage: `url(${imgUrl})` }}
    >
      <h3 className="campaign-title">{title}</h3>

      <p className="campaign-desc">{description}</p>

      <Link to={`/shop?category=${categoryId}`} className="btn btn-primary campaign-btn">
        View All
        <i className="bi bi-arrow-right"></i>
      </Link>
    </div>
  );
}

export default CampaignItem;
