import { message } from "antd";

export function getErrorMessage(error: unknown, fallback: string): string {
  if (Array.isArray(error)) return error[0] ?? fallback;

  const data = (error as any)?.response?.data;
  if (typeof data === "string" && data) return data;

  return data?.message ?? fallback;
}

export function showFormError(error: unknown, fallback: string) {
  const status = (error as any)?.response?.status;
  if (Array.isArray(error) || status === 400) {
    message.error(getErrorMessage(error, fallback));
  }
}