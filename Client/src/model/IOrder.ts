export interface IOrderItem {
  id: number;
  urunId: number;
  urunAdi: string;
  urunResmi: string;
  fiyat: number;
  miktar: number;
  beden?: string | null;
}

export interface IOrder {
  id: number;
  orderNumber: string;
  siparisTarihi: string;
  adSoyad: string;
  username: string;
  sehir: string;
  adresSatiri: string;
  postaKodu: string;
  telefon: string;
  siparisNotu: string;
  durum: string;
  odemeAlindi: boolean;
  araToplam: number;
  kuponIndirimi: number;
  kuponKodu: string | null;
  teslimatUcreti: number;
  toplam: number;
  stripeSessionUrl: string | null;
  orderItems: IOrderItem[];
}

export interface ICreateOrder {
  adSoyad: string;
  telefon: string;
  sehir: string;
  adresSatiri: string;
  postaKodu: string;
  siparisNotu?: string;
  hizliKargo: boolean;
  kuponKodu?: string;
}