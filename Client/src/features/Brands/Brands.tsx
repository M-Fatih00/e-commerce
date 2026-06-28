import "./Brands.css";

function Brands() {

  const BASE_URL = import.meta.env.VITE_BASE_URL;


  return (
    <section className="brands">
      <div className="container">
        <ul className="brand-list">
          <li className="brand-item">
            <a href="#">
              <img  src={`${BASE_URL}/img/brands/brand1.png`} alt="" />
            </a>
          </li>
          <li className="brand-item">
            <a href="#">
              <img  src={`${BASE_URL}/img/brands/brand2.png`} alt="" />
            </a>
          </li>
          <li className="brand-item">
            <a href="#">
              <img  src={`${BASE_URL}/img/brands/brand3.png`} alt="" />
            </a>
          </li>
          <li className="brand-item">
            <a href="#">
              <img  src={`${BASE_URL}/img/brands/brand4.png`} alt="" />
            </a>
          </li>
          <li className="brand-item">
            <a href="#">
              <img  src={`${BASE_URL}/img/brands/brand5.png`} alt="" />
            </a>
          </li>
          <li className="brand-item">
            <a href="#">
              <img  src={`${BASE_URL}/img/brands/brand1.png`} alt="" />
            </a>
          </li>
          
        </ul>
      </div>
    </section>
  );
}

export default Brands;
