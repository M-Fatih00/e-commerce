import "./Policy.css";

const POLICIES = [
  { icon: "bi-truck", title: "ÜCRETSİZ KARGO", text: "Belirli tutarın üzerindeki siparişlerde" },
  { icon: "bi-headset", title: "MÜŞTERİ DESTEĞİ", text: "Hafta içi 08:00 – 19:00" },
  { icon: "bi-arrow-clockwise", title: "KOLAY İADE", text: "14 gün içinde iade hakkı" },
  { icon: "bi-credit-card", title: "GÜVENLİ ÖDEME", text: "Stripe altyapısıyla güvenli ödeme" },
];

function Policy() {
  return (
    <section className="policy">
      <div className="container">
        <ul className="policy-list">
          {POLICIES.map((item) => (
            <li className="policy-item" key={item.title}>
              <i className={`bi ${item.icon}`} aria-hidden="true"></i>
              <div className="policy-texts">
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default Policy;