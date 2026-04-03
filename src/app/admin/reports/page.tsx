'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { 
  BiTrendingUp, BiDollar, BiCalendar, BiRefresh,
  BiLineChart, BiBarChart, BiPieChart, BiTrendingDown
} from 'react-icons/bi';
import { formatCurrency } from '@/utils/formatters';

interface RevenueData {
  date: string;
  total_bookings: number;
  total_revenue: number;
  growth_rate?: number;
  growth_type?: 'up' | 'down' | 'same';
}

interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  avgRevenuePerBooking: number;
  todayRevenue: number;
  todayBookings: number;
  todayGrowthRate: number;
  todayGrowthType: 'up' | 'down' | 'same';
  weekRevenue: number;
  monthRevenue: number;
}

export default function ReportsPage() {
  const { socket, isConnected } = useSocket();

  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [revenueDataForChart, setRevenueDataForChart] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalBookings: 0,
    avgRevenuePerBooking: 0,
    todayRevenue: 0,
    todayBookings: 0,
    todayGrowthRate: 0,
    todayGrowthType: 'same',
    weekRevenue: 0,
    monthRevenue: 0,
  });
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'area'>('line');
  const [isClient, setIsClient] = useState(false);

  // Format date từ ISO string sang YYYY-MM-DD
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    if (dateString.includes('T')) {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  // Sắp xếp dữ liệu theo ngày tăng dần (cũ đến mới) cho biểu đồ
  const sortDataByDateAsc = (data: any[]) => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Sắp xếp dữ liệu theo ngày giảm dần (mới nhất lên đầu) cho bảng
  const sortDataByDateDesc = (data: any[]) => {
    return [...data].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Tính tăng trưởng cho từng ngày (so với hôm qua)
  const calculateDailyGrowth = (data: RevenueData[]) => {
    const sortedAsc = sortDataByDateAsc(data);
    
    const withGrowth = sortedAsc.map((item, index) => {
      if (index === 0) {
        return { ...item, growth_rate: 0, growth_type: 'same' as const };
      }
      
      const prevDay = sortedAsc[index - 1];
      const prevRevenue = prevDay.total_revenue;
      const currentRevenue = item.total_revenue;
      
      let growthRate = 0;
      let growthType: 'up' | 'down' | 'same' = 'same';
      
      if (prevRevenue === 0) {
        growthRate = currentRevenue > 0 ? 100 : 0;
        growthType = currentRevenue > 0 ? 'up' : 'same';
      } else {
        growthRate = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
        growthType = growthRate > 0 ? 'up' : growthRate < 0 ? 'down' : 'same';
      }
      
      return {
        ...item,
        growth_rate: Math.abs(growthRate),
        growth_type: growthType,
      };
    });
    
    return withGrowth;
  };

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

    const handleBookingChanged = () => {
      if (dateRange.startDate && dateRange.endDate) {
        loadRevenueReport();
        loadStatistics();
      }
    };

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
        const formattedData = res.data.map((item: any) => ({
          ...item,
          date: formatDate(item.date)
        }));
        
        const dataWithGrowth = calculateDailyGrowth(formattedData);
        
        // Dữ liệu cho biểu đồ: sắp xếp tăng dần (cũ đến mới)
        const chartData = sortDataByDateAsc(dataWithGrowth);
        setRevenueDataForChart(chartData);
        
        // Dữ liệu cho bảng: sắp xếp giảm dần (mới lên đầu)
        const tableData = sortDataByDateDesc(dataWithGrowth);
        setRevenueData(tableData);
      }
    });
  }, [socket, dateRange]);

  const loadStatistics = useCallback(() => {
    const startDate = dateRange.startDate;
    const endDate = dateRange.endDate;
    
    if (!startDate || !endDate) return;

    socket?.emit('get-revenue-with-orders', {
      startDate: startDate,
      endDate: endDate
    }, (res: any) => {
      if (res.success) {
        const data = res.data;
        const toNumber = (value: any): number => {
          const num = Number(value);
          return isNaN(num) ? 0 : num;
        };
        
        const totalRevenue = data.reduce((sum: number, item: any) => sum + toNumber(item.total_revenue), 0);
        const totalBookings = data.reduce((sum: number, item: any) => sum + toNumber(item.total_bookings), 0);
        
        const today = new Date().toISOString().slice(0, 10);
        const todayData = data.find((item: any) => item.date === today);
        const todayRevenue = todayData?.total_revenue || 0;
        const todayBookings = todayData?.total_bookings || 0;
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        const yesterdayData = data.find((item: any) => item.date === yesterdayStr);
        const yesterdayRevenue = yesterdayData?.total_revenue || 0;
        
        let todayGrowthRate = 0;
        let todayGrowthType: 'up' | 'down' | 'same' = 'same';
        
        if (yesterdayRevenue === 0) {
          todayGrowthRate = todayRevenue > 0 ? 100 : 0;
          todayGrowthType = todayRevenue > 0 ? 'up' : 'same';
        } else {
          todayGrowthRate = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
          todayGrowthType = todayGrowthRate > 0 ? 'up' : todayGrowthRate < 0 ? 'down' : 'same';
        }
        
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().slice(0, 10);
        const weekData = data.filter((item: any) => item.date >= weekAgoStr);
        const weekRevenue = weekData.reduce((sum: number, item: any) => sum + toNumber(item.total_revenue), 0);
        
        const monthRevenue = totalRevenue;
        
        setStats({
          totalRevenue,
          totalBookings,
          avgRevenuePerBooking: totalBookings > 0 ? totalRevenue / totalBookings : 0,
          todayRevenue,
          todayBookings,
          todayGrowthRate: Math.abs(todayGrowthRate),
          todayGrowthType,
          weekRevenue,
          monthRevenue,
        });
      }
      setLoading(false);
    });
  }, [socket, dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      const growthRate = data?.growth_rate || 0;
      const growthType = data?.growth_type || 'same';
      
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Doanh thu: <span className="font-bold text-blue-600">{formatCurrency(payload[0].value)}</span>
          </p>
          {payload[1] && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Đặt bàn: <span className="font-bold text-green-600">{payload[1].value}</span>
            </p>
          )}
          {growthRate > 0 && (
            <p className={`text-sm mt-1 ${growthType === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              Tăng trưởng so với hôm qua: 
              <span className="font-bold ml-1">
                {growthType === 'up' ? '+' : '-'}{growthRate.toFixed(1)}%
              </span>
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
          <p className="text-gray-600 dark:text-gray-400 mt-1">Phân tích doanh thu và hiệu suất kinh doanh</p>
        </div>
        <button
          onClick={() => {
            loadRevenueReport();
            loadStatistics();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all"
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(stats.todayRevenue)}</p>
              <div className="flex items-center gap-1 mt-1">
                <span className={`text-xs ${stats.todayGrowthType === 'up' ? 'text-emerald-600' : stats.todayGrowthType === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {stats.todayGrowthType === 'up' ? '↑' : stats.todayGrowthType === 'down' ? '↓' : '•'} {stats.todayGrowthRate.toFixed(1)}% so với hôm qua
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">{stats.todayBookings} đơn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Stats - Week & Month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-700 dark:text-purple-400">Doanh thu 7 ngày qua</p>
          <p className="text-xl font-bold text-purple-800 dark:text-purple-300">{formatCurrency(stats.weekRevenue)}</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
          <p className="text-sm text-emerald-700 dark:text-emerald-400">Doanh thu 30 ngày qua</p>
          <p className="text-xl font-bold text-emerald-800 dark:text-emerald-300">{formatCurrency(stats.monthRevenue)}</p>
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

      {/* Revenue Chart - Sorted Ascending (old to new) */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Biểu đồ doanh thu</h2>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' && (
              <LineChart data={revenueDataForChart}>
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
              <BarChart data={revenueDataForChart}>
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
              <AreaChart data={revenueDataForChart}>
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

      {/* Revenue Table - Sorted Descending (newest first) */}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Tăng trưởng (so với hôm qua)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {revenueData.map((item, idx) => {
                const growthRate = item.growth_rate || 0;
                const growthType = item.growth_type || 'same';
                
                return (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <td className="px-6 py-4 text-sm text-black dark:text-white">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-black dark:text-white">{item.total_bookings}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">{formatCurrency(item.total_revenue)}</td>
                    <td className="px-6 py-4 text-sm text-black dark:text-white">{formatCurrency(item.total_revenue / (item.total_bookings || 1))}</td>
                    <td className="px-6 py-4 text-sm">
                      {growthRate > 0 ? (
                        <div className={`flex items-center gap-1 ${growthType === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {growthType === 'up' ? <BiTrendingUp className="h-4 w-4" /> : <BiTrendingDown className="h-4 w-4" />}
                          <span>{growthType === 'up' ? '+' : '-'}{growthRate.toFixed(1)}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
