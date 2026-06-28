import Slider from "react-slick";
import { useEffect } from "react";
import ProductItem from "./ProductItem";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchProducts, selectAllProducts } from "./catalogSlice";
import "./Products.css";

type ArrowProps = {
  onClick?: () => void;
};

function NextBtn({ onClick }: ArrowProps) {
  return (
    <button className="glide__arrow glide__arrow--right" onClick={onClick}>
      <i className="bi bi-chevron-right"></i>
    </button>
  );
}

function PrevBtn({ onClick }: ArrowProps) {
  return (
    <button className="glide__arrow glide__arrow--left" data-glide-dir="<" onClick={onClick}>
      <i className="bi bi-chevron-left"></i>
    </button>
  );
}

const getInitialSlides = () => {
  const w = window.innerWidth;
  if (w < 576) return 2;
  if (w < 768) return 2;
  if (w < 992) return 3;
  return 4;
};

function Products() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectAllProducts);
  const isLoaded = useAppSelector((state) => state.catalog.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      dispatch(fetchProducts());
    }
  }, [isLoaded, dispatch]);

  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToShow: getInitialSlides(),
    slidesToScroll: 1,
    nextArrow: <NextBtn />,
    prevArrow: <PrevBtn />,
    autoplaySpeed: 3000,
    autoplay: true,
    responsive: [
      { breakpoint: 992, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 2, slidesToScroll: 1 } },
    ],
  };

  return (
    <section className="products">
      <div className="container">
        <div className="section-title">
          <h2>Featured Products</h2>
          <p>Summer Collection New Morden Design</p>
        </div>
        <div className="product-wrapper product-carousel">
          <Slider {...sliderSettings}>
            {products.map((product) => (
              <ProductItem productItem={product as any} key={product.id} />
            ))}
          </Slider>
        </div>
      </div>
    </section>
  );
}

export default Products;