export const ORDER_STATUS = {
  PENDING: "PENDING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELED: "CANCELED",
} as const;

export const ORDER_TYPE = {
  SHOP: "SHOP",
  QUOTE: "QUOTE",
} as const;

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  PAID: "PAID",
} as const;

export const ORDER_STATUS_ENUM = Object.values(ORDER_STATUS);
export const ORDER_TYPE_ENUM = Object.values(ORDER_TYPE);
export const PAYMENT_STATUS_ENUM = Object.values(PAYMENT_STATUS);
