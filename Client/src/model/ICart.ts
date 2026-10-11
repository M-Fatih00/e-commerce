export interface ICartItem {
  cartItemId: number;
  urunId: number;
  urunAdi: string;
  urunResim: string;
  fiyat: number;
  eskiFiyat: number | null;
  indirim: number;
  miktar: number;
  beden: string | null;
  renk: string | null;
}

export interface ICart {
  cartId: number;
  cartItems: ICartItem[];
  araToplam: number;
  urunIndirimi: number;
  toplam: number;
  kargoUcreti: number;
  hizliKargoUcreti: number;
  ucretsizKargoLimiti: number;
}