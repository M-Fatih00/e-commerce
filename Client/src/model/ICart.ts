export interface ICartItem {
  cartItemId: number;
  urunId: number;
  urunAdi: string;
  urunResim: string;
  fiyat: number;
  indirim: number;
  miktar: number;
  beden: string | null;
  renk: string | null;
}
 
export interface ICart {
  cartId: number;
  customerId: string;
  cartItems: ICartItem[];
  araToplam: number;
  toplam: number;
}
 