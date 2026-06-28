const BASE_URL = import.meta.env.VITE_BASE_URL;

export const getImageUrl = (imageName: string) => {
  if (!imageName) return ""; // Resim yoksa boş dön
  return `${BASE_URL}/img/${imageName}`;
};