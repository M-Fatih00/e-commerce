export interface IProductReview {
    id: number;
    text: string;
    rating: number;
    productId: number;
    userId: string;
    userName: string;
    createdDate: string;
}