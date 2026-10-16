import React, { memo } from "react";
import { useAppSelector } from "../../store/store";
import { selectAllCartItems } from "./cartSlice";
import CartItem from "./CartItem";

const CartTable: React.FC = memo(() => {
  const cartItems = useAppSelector(selectAllCartItems);

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <p>Sepetiniz boş.</p>
      </div>
    );
  }

  return (
    <table className="shop-table">
      <thead>
        <tr>
          <th className="product-thumbnail">&nbsp;</th>
          <th className="product-thumbnail">&nbsp;</th>
          <th className="product-name">Ürün</th>
          <th className="product-price">Fiyat</th>
          <th className="product-quantity">Adet</th>
          <th className="product-subtotal">Toplam</th>
        </tr>
      </thead>
      <tbody className="cart-wrapper">
        {cartItems.map((item) => (
          <CartItem key={item.cartItemId} cartItem={item} />
        ))}
      </tbody>
    </table>
  );
});

CartTable.displayName = "CartTable";

export default CartTable;
