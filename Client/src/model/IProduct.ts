export interface IProduct {
  id: number;
  name: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  categoryId: number;
  averageRating: number;
}


export interface IProductItem {
  id: number;
  name: string;
  oldPrice: number;
  newPrice: number;
  discount: number;
  mainImage?: string;
  hoverImage?: string;
  averageRating: number;
  images: {
    id: number;
    url: string;
    isMain: boolean;
  }[];
}