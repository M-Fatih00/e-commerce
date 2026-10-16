export interface IProductReview {
  id: number;
  text: string;
  rating: number;
  productId: number;
  authorName: string;
  authorAvatar: string | null;
  isMine: boolean;
  createdDate: string;
}