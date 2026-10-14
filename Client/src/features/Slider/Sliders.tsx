import { useEffect, useState } from "react";
import SliderItem from "./SliderItem";
import "./Sliders.css";
import requests from "../../api/requests";

interface SliderData {
  id: number;
  resim: string;
}

const INTERVAL_MS = 5000;

function Sliders() {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    requests.Sliders.list()
      .then(setSliders)
      .catch(() => setSliders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (sliders.length < 2) return;
    const timer = setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [sliders.length, currentSlide]);

  if (loading) return <div className="slider-placeholder" aria-hidden="true" />;
  if (sliders.length === 0) return null;

  const hasMultiple = sliders.length > 1;

  const goTo = (index: number) => setCurrentSlide((index + sliders.length) % sliders.length);

  return (
    <section
      className="slider"
      aria-roledescription="carousel"
      aria-label="Öne çıkanlar"
    >
      <div className="slider-elements">
        <SliderItem key={currentSlide} imageSrc={sliders[currentSlide].resim} />

        {hasMultiple && (
          <>
            <div className="slider-buttons">
              <button type="button" onClick={() => goTo(currentSlide - 1)} aria-label="Önceki slayt">
                <i className="bi bi-chevron-left" />
              </button>
              <button type="button" onClick={() => goTo(currentSlide + 1)} aria-label="Sonraki slayt">
                <i className="bi bi-chevron-right" />
              </button>
            </div>

            <div className="slider-dots">
              {sliders.map((slider, index) => (
                <button
                  key={slider.id}
                  type="button"
                  className={`slider-dot ${currentSlide === index ? "active" : ""}`}
                  onClick={() => goTo(index)}
                  aria-label={`${index + 1}. slayt`}
                  aria-current={currentSlide === index}
                >
                  <span />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Sliders;