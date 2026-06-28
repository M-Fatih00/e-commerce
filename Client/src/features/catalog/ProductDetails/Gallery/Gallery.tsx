import { useEffect, useState } from "react";
import Slider from "react-slick";
import "./Gallery.css";
import { getImageUrl } from "../../../../utils/image";

interface GalleryProps {
  singleProduct: {
    images: string[];
  };
}

interface ActiveImgState {
  img: string;
  imgIndex: number;
}

function PrevBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="glide__arrow glide__arrow--left"
      onClick={onClick}
      style={{ zIndex: 2 }}
    >
      <i className="bi bi-chevron-left" />
    </button>
  );
}

function NextBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      className="glide__arrow glide__arrow--right"
      onClick={onClick}
      style={{ zIndex: 2 }}
    >
      <i className="bi bi-chevron-right" />
    </button>
  );
}

function Gallery({ singleProduct }: GalleryProps) {
  const [activeImg, setActiveImg] = useState<ActiveImgState>({
    img: "",
    imgIndex: 0,
  });

  useEffect(() => {
    if (singleProduct?.images?.length > 0) {
      setActiveImg({
        img: singleProduct.images[0],
        imgIndex: 0,
      });
    }
  }, [singleProduct]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    nextArrow: <NextBtn />,
    prevArrow: <PrevBtn />,
  };

  return (
    <div className="product-gallery">

      {/* MAIN IMAGE */}
      <div className="single-image-wrapper">
        <img
          src={getImageUrl(activeImg.img)}
          id="single-image"
          alt=""
        />
      </div>

      {/* THUMB SECTION (ORİJİNAL YAPI KORUNDU) */}
      <div className="product-thumb">
        <div className="glide__track" data-glide-el="track">
          <ol className="gallery-thumbs glide__slides">

            <Slider {...sliderSettings}>
              {singleProduct?.images?.map((itemImg, index) => (
                <li
                  className="glide__slide glide__slide--active"
                  key={index}
                  onClick={() =>
                    setActiveImg({
                      img: itemImg,
                      imgIndex: index,
                    })
                  }
                >
                  <img
                    src={getImageUrl(itemImg)}
                    alt=""
                    className={`img-fluid ${
                      activeImg.imgIndex === index ? "active" : ""
                    }`}
                  />
                </li>
              ))}
            </Slider>

          </ol>
        </div>

        <div className="glide__arrows" data-glide-el="controls"></div>
      </div>

    </div>
  );
}

export default Gallery;
