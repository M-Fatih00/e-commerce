import { useEffect, useState } from "react";
import Slider from "react-slick";
import { Image } from "antd";
import "./Gallery.css";
import { getImageUrl } from "../../../../utils/image";

interface GalleryProps {
  singleProduct: {
    images: string[];
  };
}

function PrevBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      className="glide__arrow glide__arrow--left"
      onClick={onClick}
      aria-label="Önceki görseller"
      style={{ zIndex: 2 }}
    >
      <i className="bi bi-chevron-left" />
    </button>
  );
}

function NextBtn({ onClick }: { onClick?: () => void }) {
  return (
    <button
      type="button"
      className="glide__arrow glide__arrow--right"
      onClick={onClick}
      aria-label="Sonraki görseller"
      style={{ zIndex: 2 }}
    >
      <i className="bi bi-chevron-right" />
    </button>
  );
}

function Gallery({ singleProduct }: GalleryProps) {
  const images = singleProduct?.images ?? [];
  const imageUrls = images.map((img) => getImageUrl(img));

  const [activeIndex, setActiveIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [singleProduct]);

  const sliderSettings = {
    dots: false,
    infinite: images.length > 3,
    slidesToShow: Math.min(3, Math.max(images.length, 1)),
    slidesToScroll: 1,
    nextArrow: <NextBtn />,
    prevArrow: <PrevBtn />,
  };

  if (images.length === 0) return <div className="product-gallery" />;

  return (
    <div className="product-gallery">
      <div className="single-image-wrapper">
        <button
          type="button"
          className="single-image-button"
          onClick={() => setPreviewOpen(true)}
          aria-label="Görseli büyüt"
        >
          <img
            key={activeIndex}
            src={imageUrls[activeIndex]}
            id="single-image"
            className="gallery-main-image"
            alt=""
          />
          <span className="gallery-zoom-hint" aria-hidden="true">
            <i className="bi bi-arrows-fullscreen" />
          </span>
        </button>
      </div>

      <Image.PreviewGroup
        items={imageUrls}
        preview={{
          open: previewOpen,
          current: activeIndex,
          onOpenChange: (open: boolean) => setPreviewOpen(open),
          onChange: (current: number) => setActiveIndex(current),
        }}
      />

      <div className="product-thumb">
        <div className="glide__track" data-glide-el="track">
          <ol className="gallery-thumbs glide__slides">
            <Slider {...sliderSettings}>
              {images.map((itemImg, index) => (
                <li
                  className="glide__slide glide__slide--active"
                  key={`${itemImg}-${index}`}
                  onClick={() => setActiveIndex(index)}
                >
                  <img
                    src={imageUrls[index]}
                    alt={`${index + 1}. görsel`}
                    className={`img-fluid ${activeIndex === index ? "active" : ""}`}
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