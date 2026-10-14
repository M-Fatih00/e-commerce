import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/image";

interface SliderProps {
  imageSrc: string;
}

function SliderItem({ imageSrc }: SliderProps) {
  return (
    <div className="slider-item fade">
      <div className="slider-image">
        <img src={getImageUrl(imageSrc)} className="img-fluid" alt="" />
      </div>
      <div className="container">
        <p className="slider-title">YENİ SEZON</p>
        <h2 className="slider-heading">Yeni sezon ürünlerini keşfedin</h2>
        <Link to="/shop" className="btn btn-lg btn-primary">
          Alışverişe Başla
        </Link>
      </div>
    </div>
  );
}

export default SliderItem;