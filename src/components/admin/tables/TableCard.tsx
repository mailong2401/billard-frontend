"use client";

import { useState, useEffect, memo } from "react";
import { Table } from "@/types";
import { TABLE_STATUS, TABLE_TYPE } from "@/utils/constants";
import { formatCurrency } from "@/utils/formatters";
import {
  BiEdit,
  BiTrash,
  BiCalendar,
  BiPlay,
  BiStopwatch,
  BiTime,
  BiCoffee,
} from "react-icons/bi";
import PlayDirectModal from "@/components/admin/tables/PlayDirectModal";

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
  onDelete: (id: number) => void;
  onBook: (table: Table) => void;
  onPlayDirect?: (
    table: Table,
    customerName: string,
    customerPhone: string,
  ) => void;
  onPlay?: (table: Table, bookingId: number) => void;
  onEnd?: (table: Table, bookingId: number) => void;
  onOrder?: (table: Table, bookingId: number) => void;
  activeBooking?: {
    id: number;
    start_time: string;
    current_amount: number;
    hours_played: number;
    customer_name?: string;
    customer_phone?: string;
    food_total?: number;
    total_amount?: number;
    items_count?: number;
  } | null;
}

// Hàm format thời gian chi tiết
const formatDuration = (hours: number): string => {
  const totalSeconds = Math.floor(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const TableCard = memo(function TableCard({
  table,
  onEdit,
  onDelete,
  onBook,
  onPlayDirect,
  onPlay,
  onEnd,
  onOrder,
  activeBooking,
}: TableCardProps) {
  const status = TABLE_STATUS[table.status];
  const type = TABLE_TYPE[table.table_type];
  const [currentAmount, setCurrentAmount] = useState(
    activeBooking?.current_amount || 0,
  );
  const [hoursPlayed, setHoursPlayed] = useState(
    activeBooking?.hours_played || 0,
  );
  const [showPlayDirectModal, setShowPlayDirectModal] = useState(false);
  const [durationText, setDurationText] = useState("00:00");
  const [isFlipped, setIsFlipped] = useState(false);

  const getTypeColor = (typeCode: string) => {
    const colors: Record<string, string> = {
      standard: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      vip: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      tournament:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[typeCode] || colors.standard;
  };

  // Update local state when activeBooking changes
  useEffect(() => {
    if (activeBooking) {
      setCurrentAmount(activeBooking.current_amount || 0);
      setHoursPlayed(activeBooking.hours_played || 0);
    }
  }, [activeBooking]);

  // Real-time timer for occupied tables - cập nhật mỗi giây
  useEffect(() => {
    if (table.status === "occupied" && activeBooking?.start_time) {
      const interval = setInterval(() => {
        const start = new Date(activeBooking.start_time);
        const now = new Date();
        const hours = Math.max(
          0,
          (now.getTime() - start.getTime()) / (1000 * 60 * 60),
        );
        const amount = Math.ceil(hours) * table.price_per_hour;

        setHoursPlayed(hours);
        setCurrentAmount(amount);
        setDurationText(formatDuration(hours));
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    } else if (activeBooking?.hours_played) {
      setDurationText(formatDuration(activeBooking.hours_played));
    }
  }, [
    table.status,
    activeBooking?.start_time,
    table.price_per_hour,
    activeBooking?.hours_played,
  ]);

  const isPlaying = table.status === "occupied";
  const isReserved = table.status === "reserved";
  const isAvailable = table.status === "available";

  // Hàm xử lý submit từ modal PlayDirect
  const handlePlayDirectSubmit = (
    customerName: string,
    customerPhone: string,
  ) => {
    onPlayDirect?.(table, customerName, customerPhone);
    setShowPlayDirectModal(false);
  };

  // Xử lý Play cho bàn đã đặt (reserved)
  const handlePlayReserved = () => {
    if (activeBooking?.id) {
      onPlay?.(table, activeBooking.id);
    } else {
      onPlay?.(table, 0);
    }
  };

  const tableAmount = currentAmount;
  const foodAmount = activeBooking?.food_total || 0;
  const totalCurrentAmount = tableAmount + foodAmount;

  const getStatusColor = (statusCode: string) => {
    const colors: Record<string, string> = {
      available:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
      occupied: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      reserved:
        "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      maintenance:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
      cleaning:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    };
    return colors[statusCode] || colors.available;
  };

  const formatStartTime = (startTime: string) => {
    if (!startTime) return "Chưa có";
    return new Date(startTime).toLocaleTimeString("vi-VN");
  };

  return (
    <>
      <div
        className="relative w-full h-full min-h-[420px] cursor-pointer"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
      >
        <div
          className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
        >
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-black rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
            {/* Góc trên bên trái - Loại bàn */}
            <div className="absolute top-3 left-3">
              <span
                className={`px-2 py-1 rounded-md text-2xl font-medium ${getTypeColor(table.table_type)}`}
              >
                {type.label}
              </span>
            </div>

            {/* Trạng thái bàn - góc trên bên phải */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-3 py-1 rounded-full text-2xl font-bold ${getStatusColor(table.status)}`}
              >
                {status.label}
              </span>
            </div>

            {/* Nội dung chính giữa */}
            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Tên bàn */}
              <div className="text-center mb-4">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  {table.table_number}
                </p>
                <h3 className="text-5xl font-bold text-black dark:text-white">
                  {table.table_name}
                </h3>

                <p className="text-base text-gray-500 dark:text-gray-400">
                  {table.location}
                </p>
              </div>

              {/* Thông tin khi đang chơi */}
              {isPlaying && (
                <div className="text-center space-y-3 mt-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Thời gian đã chơi
                    </p>
                    <p className="text-4xl font-mono font-bold text-black dark:text-white">
                      {durationText}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Tổng tiền hiện tại
                    </p>
                    <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalCurrentAmount)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Mặt sau - Chi tiết đầy đủ */}
          <div className="absolute w-full h-full backface-hidden bg-white dark:bg-black rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-5 flex flex-col rotate-y-180 overflow-y-auto">
            {/* Header: Tên bàn và trạng thái */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  {table.table_name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {table.table_number}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${getStatusColor(table.status)}`}
              >
                {status.label}
              </span>
            </div>

            {/* Thông tin cơ bản */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Loại bàn:
                </span>
                <span className="font-medium text-black dark:text-white">
                  {type.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Giá:</span>
                <span className="font-medium text-black dark:text-white">
                  {formatCurrency(table.price_per_hour)} / giờ
                </span>
              </div>
              {table.location && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Vị trí:
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {table.location}
                  </span>
                </div>
              )}

              {/* Thông tin chơi khi bàn đang occupied */}
              {isPlaying && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Thời gian đã chơi:
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {durationText}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Bắt đầu lúc:
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {activeBooking
                        ? formatStartTime(activeBooking.start_time)
                        : "00:00:00"}
                    </span>
                  </div>
                </>
              )}

              {/* Thông tin đặt bàn khi bàn reserved */}
              {isReserved && activeBooking && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Khách hàng:
                    </span>
                    <span className="font-medium text-black dark:text-white truncate max-w-[180px]">
                      {activeBooking.customer_name || "Chưa có"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      SĐT:
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {activeBooking.customer_phone || "Chưa có"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Đặt lúc:
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {formatStartTime(activeBooking.start_time)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Thông tin thanh toán - chỉ hiển thị khi đang chơi */}
            {isPlaying && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">
                    Tiền bàn:
                  </span>
                  <span className="font-medium text-black dark:text-white">
                    {formatCurrency(tableAmount)}
                  </span>
                </div>
                {foodAmount > 0 && (
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tiền đồ ăn/uống:
                    </span>
                    <span className="font-medium text-black dark:text-white">
                      {formatCurrency(foodAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700 mt-1">
                  <span className="text-sm font-semibold text-black dark:text-white">
                    Tổng cộng:
                  </span>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(totalCurrentAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Các nút chức năng */}
            <div className="mt-auto">
              <div className="flex space-x-2">
                {/* Play ngay button - chỉ hiển thị khi bàn trống */}
                {isAvailable && onPlayDirect && (
                  <button
                    onClick={() => setShowPlayDirectModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <BiPlay className="h-4 w-4" />
                    <span>Play ngay</span>
                  </button>
                )}

                {/* Đặt bàn - chỉ hiển thị khi bàn trống */}
                {isAvailable && (
                  <button
                    onClick={() => onBook(table)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                    title="Đặt bàn"
                  >
                    <BiCalendar className="h-4 w-4" />
                  </button>
                )}

                {/* Play button - hiển thị khi bàn đã được đặt (reserved) */}
                {isReserved && onPlay && (
                  <button
                    onClick={handlePlayReserved}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <BiPlay className="h-4 w-4" />
                    <span>Bắt đầu</span>
                  </button>
                )}

                {/* Gọi đồ - hiển thị khi bàn đang chơi */}
                {isPlaying && onOrder && activeBooking && (
                  <button
                    onClick={() => onOrder(table, activeBooking.id)}
                    className="px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                    title="Gọi đồ"
                  >
                    <BiCoffee className="h-4 w-4" />
                  </button>
                )}

                {/* Kết thúc - hiển thị khi bàn đang chơi */}
                {isPlaying && onEnd && activeBooking && (
                  <button
                    onClick={() => onEnd(table, activeBooking.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <BiStopwatch className="h-4 w-4" />
                    <span>Kết thúc</span>
                  </button>
                )}

                {/* Sửa và Xóa - chỉ hiển thị khi bàn không đang chơi và không đặt */}
                {!isPlaying && !isReserved && (
                  <>
                    <button
                      onClick={() => onEdit(table)}
                      className="px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
                      title="Sửa"
                    >
                      <BiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(table.id)}
                      className="px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-black border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-[1.02] active:scale-95"
                      title="Xóa"
                    >
                      <BiTrash className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Play Direct Modal */}
      {showPlayDirectModal && (
        <PlayDirectModal
          isOpen={showPlayDirectModal}
          onClose={() => setShowPlayDirectModal(false)}
          table={table}
          onSubmit={handlePlayDirectSubmit}
        />
      )}

      <style jsx>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </>
  );
});

export default TableCard;
