export const formatPrice = (value: number) =>
  value.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

export const formatOrderNumber = (value: string) =>
  /^\d{10}$/.test(value) ? `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}` : value;