export interface IProductDetail {
  id: number;
  name: string;
  description: string;

  oldPrice: number;
  newPrice: number;
  discount: number;

  categoryName: string;

  images: string[];
  colors?: string[];
  sizes: { size: string; stock: number }[];

  averageRating: number;
  reviewCount: number;
}