import Slider from "react-slick";
import { useEffect } from "react";
import ProductItem from "./ProductItem";
import ProductItemSkeleton from "./ProductItemSkeleton";
import { useAppDispatch, useAppSelector } from "../../store/store";
import { fetchProducts, selectAllProducts } from "./catalogSlice";
import Reveal from "../../components/Reveal";
import "./Products.css";

type ArrowProps = {
  onClick?: () => void;
};

function NextBtn({ onClick }: ArrowProps) {
  return (
    <button type="button" className="glide__arrow glide__arrow--right" onClick={onClick} aria-label="Sonraki ürünler">
      <i className="bi bi-chevron-right"></i>
    </button>
  );
}

function PrevBtn({ onClick }: ArrowProps) {
  return (
    <button type="button" className="glide__arrow glide__arrow--left" onClick={onClick} aria-label="Önceki ürünler">
      <i className="bi bi-chevron-left"></i>
    </button>
  );
}

const getInitialSlides = () => {
  const w = window.innerWidth;
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

  const slidesToShow = getInitialSlides();
  const showSkeleton = !isLoaded && products.length === 0;

  const sliderSettings = {
    dots: false,
    infinite: true,
    slidesToShow,
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
      <Reveal className="container">
        <div className="section-title">
          <h2>Öne Çıkan Ürünler</h2>
          <p>Sezonun en çok tercih edilen parçaları</p>
        </div>

        {showSkeleton ? (
          <div
            className="product-skeleton-grid"
            style={{ gridTemplateColumns: `repeat(${slidesToShow}, 1fr)` }}
            aria-busy="true"
            aria-label="Ürünler yükleniyor"
          >
            {Array.from({ length: slidesToShow }, (_, i) => (
              <ProductItemSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="product-wrapper product-carousel">
            <Slider {...sliderSettings}>
              {products.map((product) => (
                <ProductItem productItem={product as any} key={product.id} />
              ))}
            </Slider>
          </div>
        )}
      </Reveal>
    </section>
  );
}

export default Products;