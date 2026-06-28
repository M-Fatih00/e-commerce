export interface IOrderItem {
  id: number;
  urunId: number;
  urunAdi: string;
  urunResmi: string;
  fiyat: number;
  miktar: number;
}

export interface IOrder {
  id: number;
  siparisTarihi: string;
  adSoyad: string;
  username: string;
  sehir: string;
  adresSatiri: string;
  postaKodu: string;
  telefon: string;
  siparisNotu: string;
  durum: string;
  araToplam: number;
  kuponIndirimi: number;
  kuponKodu: string | null;
  teslimatUcreti: number;
  toplam: number;
  iyzicoToken: string | null;
  stripeSessionUrl: string | null;
  orderItems: IOrderItem[];
}

export interface ICreateOrder {
  adSoyad: string;
  telefon: string;
  sehir: string;
  adresSatiri: string;
  postakodu: string;
  siparisNotu?: string;
  hizliKargo: boolean;
  kuponKodu?: string;
}