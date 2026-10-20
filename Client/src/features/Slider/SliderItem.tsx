import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";

interface SliderProps {
  imageSrc: string;
  title?: string | null;
  heading?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
}

function SliderItem({ imageSrc, title, heading, buttonText, buttonLink }: SliderProps) {
  const hasButton = !!buttonText && !!buttonLink;
  const hasContent = !!title || !!heading || hasButton;

  return (
    <div className="slider-item fade">
      <div className="slider-image">
        <img src={getImageUrl(imageSrc)} className="img-fluid" alt="" />
      </div>
      {hasContent && (
        <div className="container">
          {title && <p className="slider-title">{title}</p>}
          {heading && <h2 className="slider-heading">{heading}</h2>}
          {hasButton && (
            <Link to={buttonLink!} className="btn btn-lg btn-primary">
              {buttonText}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default SliderItem;