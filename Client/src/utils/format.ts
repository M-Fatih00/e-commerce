export const formatPrice = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });