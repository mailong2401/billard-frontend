'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  BiTrendingUp, BiDollar, BiCalendar, BiRefresh,
  BiLineChart, BiBarChart, BiPieChart
} from 'react-icons/bi';
import { formatCurrency } from '@/utils/formatters';

interface RevenueData {
  date: string;
  total_bookings: number;
  total_revenue: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  avgRevenuePerBooking: number;
  growthRate: number;
  todayRevenue: number;
  todayBookings: number;
  weekRevenue: number;
  monthRevenue: number;
}

export default function ReportsPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    avgRevenuePerBooking: 0,
    growthRate: 0,
    todayRevenue: 0,
    todayBookings: 0,
    weekRevenue: 0,
    monthRevenue: 0,
  });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);
    
    setDateRange({
      startDate: lastMonth.toISOString().slice(0, 10),
      endDate: today.toISOString().slice(0, 10),
    });
  }, []);

  useEffect(() => {
    if (isClient && socket && isConnected && dateRange.startDate && dateRange.endDate) {
      loadRevenueReport();
      loadStatistics();
    }
  }, [isClient, socket, isConnected, dateRange]);

  // ================= REALTIME UPDATES =================
  useEffect(() => {
    if (!socket || !isClient) return;

    // Khi có booking mới hoặc booking được cập nhật
    const handleBookingChanged = () => {
      // Reload dữ liệu khi có thay đổi
      if (dateRange.startDate && dateRange.endDate) {
        loadRevenueReport();
        loadStatistics();
      }
    };

    // Lắng nghe các sự kiện ảnh hưởng đến doanh thu
    socket.on('new-booking', handleBookingChanged);
    socket.on('booking-updated', handleBookingChanged);
    socket.on('booking-cancelled', handleBookingChanged);
    socket.on('booking-checked-out', handleBookingChanged);

    return () => {
      socket.off('new-booking', handleBookingChanged);
      socket.off('booking-updated', handleBookingChanged);
      socket.off('booking-cancelled', handleBookingChanged);
      socket.off('booking-checked-out', handleBookingChanged);
    };
  }, [socket, isClient, dateRange]);

  const loadRevenueReport = useCallback(() => {
    socket?.emit('get-revenue-report', {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }, (res: any) => {
      if (res.success) {
        setRevenueData(res.data);
      }
    });
  }, [socket, dateRange]);

  const loadStatistics = useCallback(() => {
    socket?.emit('get-revenue-with-orders', {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    }, (res: any) => {
      if (res.success) {
        const data = res.data;
        const toNumber = (value: any): number => {
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        };
        
        const totalRevenue = data.reduce((sum: number, item: any) => sum + toNumber(item.total_revenue), 0);
        const totalBookings = data.reduce((sum: number, item: any) => sum + toNumber(item.total_bookings), 0);
        
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalBookings,
          avgRevenuePerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        }));
      }
      setLoading(false);
    });
  }, [socket, dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Doanh thu: <span className="font-bold text-green-600">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đặt bàn: <span className="font-bold text-blue-600">{payload[1].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (!isClient || !isConnected || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Thống kê & Báo cáo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Phân tích doanh thu và hiệu suất kinh doanh (tự động cập nhật)</p>
        </div>
        <button
          onClick={() => {
            loadRevenueReport();
            loadStatistics();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          <BiRefresh className="h-5 w-5" />
          Làm mới
        </button>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Từ ngày</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-black dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Đến ngày</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-black text-black dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              loadRevenueReport();
              loadStatistics();
            }}
            className="px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-md transition-all"
          >
            Xem báo cáo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <BiDollar className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng đặt bàn</p>
              <p className="text-2xl font-bold text-black dark:text-white">{stats.totalBookings}</p>
            </div>
            <BiCalendar className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">TB mỗi đơn</p>
              <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(stats.avgRevenuePerBooking)}</p>
            </div>
            <BiTrendingUp className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tăng trưởng</p>
              <p className="text-2xl font-bold text-emerald-600">+{stats.growthRate}%</p>
            </div>
            <BiLineChart className="h-8 w-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setChartType('line')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            chartType === 'line' 
              ? 'bg-black text-white dark:bg-white dark:text-black' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <BiLineChart className="h-4 w-4" />
          Đường
        </button>
        <button
          onClick={() => setChartType('bar')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            chartType === 'bar' 
              ? 'bg-black text-white dark:bg-white dark:text-black' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <BiBarChart className="h-4 w-4" />
          Cột
        </button>
        <button
          onClick={() => setChartType('area')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            chartType === 'area' 
              ? 'bg-black text-white dark:bg-white dark:text-black' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <BiPieChart className="h-4 w-4" />
          Vùng
        </button>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Biểu đồ doanh thu</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" tickFormatter={(value) => `${value / 1000000}M`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="total_revenue" name="Doanh thu" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="total_bookings" name="Số đơn" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            )}
            {chartType === 'bar' && (
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis yAxisId="left" stroke="#9CA3AF" tickFormatter={(value) => `${value / 1000000}M`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar yAxisId="left" dataKey="total_revenue" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="total_bookings" name="Số đơn" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
            {chartType === 'area' && (
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="total_revenue" name="Doanh thu" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products / Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Sản phẩm bán chạy</h2>
          <div className="space-y-3">
            {[
              { name: 'Coca Cola', revenue: 1250000, percentage: 25 },
              { name: 'Bia Tiger', revenue: 980000, percentage: 20 },
              { name: 'Khoai tây chiên', revenue: 750000, percentage: 15 },
              { name: 'Mì tôm', revenue: 620000, percentage: 12 },
              { name: 'Trà đào', revenue: 580000, percentage: 10 },
            ].map((product, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
                  <span className="text-black dark:text-white font-medium">{formatCurrency(product.revenue)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-sky-600 h-2 rounded-full" style={{ width: `${product.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Giờ cao điểm</h2>
          <div className="space-y-3">
            {[
              { hour: '18:00 - 19:00', bookings: 45 },
              { hour: '19:00 - 20:00', bookings: 52 },
              { hour: '20:00 - 21:00', bookings: 48 },
              { hour: '21:00 - 22:00', bookings: 35 },
              { hour: '22:00 - 23:00', bookings: 28 },
            ].map((peak, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{peak.hour}</span>
                  <span className="text-black dark:text-white font-medium">{peak.bookings} đặt bàn</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(peak.bookings / 52) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-black dark:text-white">Chi tiết doanh thu theo ngày</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Số đơn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Doanh thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">TB mỗi đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {revenueData.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4 text-sm text-black dark:text-white">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">{item.total_bookings}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.total_revenue)}</td>
                  <td className="px-6 py-4 text-sm text-black dark:text-white">{formatCurrency(item.total_revenue / (item.total_bookings || 1))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
