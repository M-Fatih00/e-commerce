import { useEffect, useState } from "react";
import SliderItem from "./SliderItem";
import "./Sliders.css";
import requests from "../../api/requests";
import { Spin } from "antd";

interface SliderData {
  id: number;
  resim: string;
}

function Sliders() {
  const [sliders, setSliders] = useState<SliderData[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const data = await requests.Sliders.list();
        setSliders(data);
      } catch (error) {
        console.error("Slider verisi çekilemedi:", error);
      }
    };
    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliders.length]);

  const nextSlide = () => {
    if (sliders.length === 0) return;
    setCurrentSlide((prevSlide) => (prevSlide + 1) % sliders.length);
  };

  const prevSlide = () => {
    if (sliders.length === 0) return;
    setCurrentSlide((prevSlide) => (prevSlide - 1 + sliders.length) % sliders.length);
  };

  if (sliders.length === 0)
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );

  return (
    <section className="slider">
      <div className="slider-elements">
        <SliderItem key={currentSlide} imageSrc={sliders[currentSlide].resim} />

        <div className="slider-buttons">
          <button onClick={prevSlide}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <button onClick={nextSlide}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        <div className="slider-dots">
          {sliders.map((_, dotIndex) => (
            <button
              key={dotIndex}
              className={`slider-dot ${currentSlide === dotIndex ? "active" : ""}`}
              onClick={() => setCurrentSlide(dotIndex)}
            >
              <span></span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Sliders;