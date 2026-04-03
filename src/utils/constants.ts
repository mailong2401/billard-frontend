import { TableStatus, TableType, BookingStatus } from "@/types";

export const TABLE_STATUS: Record<
  TableStatus,
  { label: string; color: string; bgColor: string }
> = {
  available: {
    label: "Trống",
    color: "text-green-700",
    bgColor: "bg-green-100",
  },
  occupied: {
    label: "Đang chơi",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
  reserved: {
    label: "Đã đặt",
    color: "text-yellow-700",
    bgColor: "bg-yellow-100",
  },
  maintenance: {
    label: "Bảo trì",
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  },
  cleaning: {
    label: "Đang dọn",
    color: "text-blue-700",
    bgColor: "bg-blue-100",
  },
};

export const TABLE_TYPE: Record<
  TableType,
  { label: string; priceSuffix: string }
> = {
  standard: { label: "Standard", priceSuffix: "VNĐ/giờ" },
  vip: { label: "VIP", priceSuffix: "VNĐ/giờ" },
  tournament: { label: "Tournament", priceSuffix: "VNĐ/giờ" },
};

export const BOOKING_STATUS: Record<
  BookingStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "text-yellow-700 dark:text-yellow-400",
    bgColor: "bg-yellow-100 dark:bg-yellow-950/30",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-700 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
  },
  checked_in: {
    label: "Đã nhận bàn",
    color: "text-purple-700 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-950/30",
  },
  completed: {
    label: "Hoàn thành",
    color: "text-green-700 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-950/30",
  },
  cancelled: {
    label: "Đã hủy",
    color: "text-red-700 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-950/30",
  },
};

export const SOCKET_EVENTS = {
  GET_TABLES: "get-tables",
  CREATE_TABLE: "create-table",
  UPDATE_TABLE: "update-table",
  DELETE_TABLE: "delete-table",
  UPDATE_TABLE_STATUS: "update-table-status",
  CREATE_BOOKING: "create-booking",
  GET_BOOKINGS: "get-bookings",
  UPDATE_BOOKING: "update-booking",
  CANCEL_BOOKING: "cancel-booking",
  CHECK_IN: "check-in",
  CHECK_OUT: "check-out",
  TABLE_STATUS_CHANGED: "table-status-changed",
  NEW_BOOKING: "new-booking",
  BOOKING_UPDATED: "booking-updated",
};

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3000";
