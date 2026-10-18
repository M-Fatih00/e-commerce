import { Tag } from "antd";
import type { ReactNode } from "react";
import {
  CarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

export type OrderStatusMeta = {
  label: string;
  color: string;
  icon: ReactNode;
};

export const getOrderStatus = (durum: string, odemeAlindi = true): OrderStatusMeta => {
  switch (durum) {
    case "Ödendi":
      return { label: "Hazırlanıyor", color: "warning", icon: <InboxOutlined /> };
    case "Kargoda":
      return { label: "Kargoda", color: "processing", icon: <CarOutlined /> };
    case "Teslim Edildi":
      return { label: "Teslim Edildi", color: "success", icon: <CheckCircleOutlined /> };
    case "Beklemede":
      return { label: "Ödeme Bekleniyor", color: "default", icon: <ClockCircleOutlined /> };
    case "İptal":
      return odemeAlindi
        ? { label: "İade Edildi", color: "error", icon: <RollbackOutlined /> }
        : { label: "Yarım Kaldı", color: "default", icon: <CloseCircleOutlined /> };
    default:
      return { label: durum, color: "default", icon: null };
  }
};

type OrderStatusTagProps = {
  durum: string;
  odemeAlindi?: boolean;
};

export function OrderStatusTag({ durum, odemeAlindi = true }: OrderStatusTagProps) {
  const meta = getOrderStatus(durum, odemeAlindi);
  return (
    <Tag color={meta.color} icon={meta.icon} variant="filled">
      {meta.label}
    </Tag>
  );
}