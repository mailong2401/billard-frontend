export type TableStatus = 'available' | 'occupied' | 'reserved' | 'maintenance' | 'cleaning';
export type TableType = 'standard' | 'vip' | 'tournament';
export type BookingStatus = 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';

export interface Table {
  id: number;
  table_number: string;
  table_name: string;
  table_type: TableType;
  status: TableStatus;
  price_per_hour: number;
  description: string | null;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingItem {
  id: number;
  booking_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: 'pending' | 'preparing' | 'served' | 'cancelled';
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: number;
  booking_code: string;
  table_id: number;
  table_number?: string;
  table_name?: string;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  total_amount: number;
  status: BookingStatus;
  table_type?: string;
  items?: BookingItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTableData {
  table_number: string;
  table_name: string;
  table_type: TableType;
  price_per_hour: number;
  description?: string;
  location?: string;
}

export interface UpdateTableData extends Partial<CreateTableData> {
  id: number;
  status?: TableStatus;
}

export interface CreateBookingData {
  table_id: number;
  customer_name: string;
  customer_phone: string;
  start_time: string;
  end_time: string;
  notes?: string;
}

export interface UpdateBookingData {
  id: number;
  status?: BookingStatus;
  customer_name?: string;
  customer_phone?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TableStatistics {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ table_type: string; count: number }>;
}
