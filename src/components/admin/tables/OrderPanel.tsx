'use client';

import { useState, useEffect } from 'react';
import { BiCart, BiPlus, BiMinus, BiTrash, BiX, BiCoffee, BiBeer, BiFoodMenu } from 'react-icons/bi';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  category_name: string;
  description?: string;
}

interface BookingItem {
  id?: number;
  booking_id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  status: string;
  notes?: string;
}

interface Booking {
  id: number;
  booking_code: string;
  table_amount: number;
  food_total: number;
  total_with_food: number;
  status: string;
  items: BookingItem[];
  created_at: string;
}

interface OrderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number;
  bookingId: number;
  tableName: string;
  socket: any;
  onOrderUpdate?: () => void;
}

export default function OrderPanel({
  isOpen,
  onClose,
  tableId,
  bookingId,
  tableName,
  socket,
  onOrderUpdate
}: OrderPanelProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [cart, setCart] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const toNumber = (value: any): number => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  useEffect(() => {
    if (isOpen && socket) {
      loadProducts();
      loadCategories();
      loadCurrentBooking();
    }
  }, [isOpen, socket, bookingId]);

  useEffect(() => {
    if (isOpen && socket) {
      socket.emit('join-table-room', { tableId });
      return () => {
        socket.emit('leave-table-room', { tableId });
      };
    }
  }, [isOpen, socket, tableId]);

  // Listen for booking updates
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleBookingUpdated = (data: any) => {
      if (data.id === currentBooking?.id) {
        const updatedBooking = {
          ...data,
          table_amount: toNumber(data.table_amount),
          food_total: toNumber(data.food_total),
          total_with_food: toNumber(data.total_with_food),
          items: (data.items || []).map((item: any) => ({
            ...item,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            subtotal: toNumber(item.subtotal)
          }))
        };
        setCurrentBooking(updatedBooking);
        setCart(updatedBooking.items || []);
        if (onOrderUpdate) onOrderUpdate();
      }
    };

    socket.on('booking-updated', handleBookingUpdated);

    return () => {
      socket.off('booking-updated', handleBookingUpdated);
    };
  }, [socket, currentBooking?.id, isOpen, onOrderUpdate]);

  const loadProducts = () => {
    socket?.emit('get-products', {}, (res: any) => {
      if (res.success) {
        const productsWithNumberPrice = res.data.map((p: any) => ({
          ...p,
          price: toNumber(p.price)
        }));
        setProducts(productsWithNumberPrice);
      }
    });
  };

  const loadCategories = () => {
    socket?.emit('get-categories', {}, (res: any) => {
      if (res.success) {
        setCategories(res.data);
        if (res.data.length > 0 && !selectedCategory) {
          setSelectedCategory(res.data[0].id);
        }
      }
    });
  };

  const loadCurrentBooking = () => {
    socket?.emit('get-booking-by-id', { id: bookingId }, (res: any) => {
      if (res.success && res.data) {
        const booking = {
          ...res.data,
          table_amount: toNumber(res.data.table_amount),
          food_total: toNumber(res.data.food_total),
          total_with_food: toNumber(res.data.total_with_food),
          items: (res.data.items || []).map((item: any) => ({
            ...item,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            subtotal: toNumber(item.subtotal)
          }))
        };
        setCurrentBooking(booking);
        setCart(booking.items);
      }
    });
  };

  // Auto add to booking immediately
  const addToCart = (product: Product) => {
    setLoading(true);
    socket?.emit('add-booking-item', {
      bookingId: bookingId,
      productId: product.id,
      quantity: 1,
      notes: ''
    }, (res: any) => {
      if (res.success) {
        const updatedBooking = {
          ...res.booking,
          table_amount: toNumber(res.booking.table_amount),
          food_total: toNumber(res.booking.food_total),
          total_with_food: toNumber(res.booking.total_with_food),
          items: (res.booking.items || []).map((item: any) => ({
            ...item,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            subtotal: toNumber(item.subtotal)
          }))
        };
        setCurrentBooking(updatedBooking);
        setCart(updatedBooking.items);
        if (onOrderUpdate) onOrderUpdate();
      }
      setLoading(false);
    });
  };

  const updateCartItem = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(itemId);
      return;
    }
    
    setLoading(true);
    socket?.emit('update-booking-item', {
      itemId,
      quantity: newQuantity
    }, (res: any) => {
      if (res.success) {
        const updatedBooking = {
          ...res.booking,
          table_amount: toNumber(res.booking.table_amount),
          food_total: toNumber(res.booking.food_total),
          total_with_food: toNumber(res.booking.total_with_food),
          items: (res.booking.items || []).map((item: any) => ({
            ...item,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            subtotal: toNumber(item.subtotal)
          }))
        };
        setCurrentBooking(updatedBooking);
        setCart(updatedBooking.items);
        if (onOrderUpdate) onOrderUpdate();
      }
      setLoading(false);
    });
  };

  const removeCartItem = (itemId: number) => {
    setLoading(true);
    socket?.emit('remove-booking-item', { itemId }, (res: any) => {
      if (res.success) {
        const updatedBooking = {
          ...res.booking,
          table_amount: toNumber(res.booking.table_amount),
          food_total: toNumber(res.booking.food_total),
          total_with_food: toNumber(res.booking.total_with_food),
          items: (res.booking.items || []).map((item: any) => ({
            ...item,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            subtotal: toNumber(item.subtotal)
          }))
        };
        setCurrentBooking(updatedBooking);
        setCart(updatedBooking.items);
        if (onOrderUpdate) onOrderUpdate();
      }
      setLoading(false);
    });
  };

  const markItemAsServed = (itemId: number) => {
    socket?.emit('update-booking-item-status', {
      itemId,
      status: 'served'
    }, (res: any) => {
      if (res.success) {
        const updatedBooking = {
          ...res.booking,
          table_amount: toNumber(res.booking.table_amount),
          food_total: toNumber(res.booking.food_total),
          total_with_food: toNumber(res.booking.total_with_food),
          items: (res.booking.items || []).map((item: any) => ({
            ...item,
            quantity: toNumber(item.quantity),
            price: toNumber(item.price),
            subtotal: toNumber(item.subtotal)
          }))
        };
        setCurrentBooking(updatedBooking);
        setCart(updatedBooking.items);
        if (onOrderUpdate) onOrderUpdate();
      }
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      pending: { label: 'Chờ xử lý', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      preparing: { label: 'Đang chuẩn bị', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
      served: { label: 'Đã phục vụ', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
      cancelled: { label: 'Đã hủy', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' }
    };
    return labels[status] || { label: status, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400' };
  };

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('bia')) return <BiBeer className="inline mr-1" />;
    if (name.includes('ăn') || name.includes('food')) return <BiFoodMenu className="inline mr-1" />;
    return <BiCoffee className="inline mr-1" />;
  };

  const calculateCartTotal = (): number => {
    return cart.reduce((sum, item) => {
      if (item.status === 'served') return sum;
      return sum + toNumber(item.subtotal);
    }, 0);
  };

  const cartTotal = calculateCartTotal();
  const activeCartItems = cart.filter(item => item.status !== 'served');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-5xl bg-white dark:bg-black h-full overflow-y-auto border-l border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-black dark:text-white">
              Đặt đồ ăn/uống
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Bàn {tableName}
            </p>
            {currentBooking && (
              <p className="text-xs text-gray-400">
                Mã đặt: {currentBooking.booking_code}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <BiX className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left - Product List */}
            <div className="lg:col-span-2">
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                />
              </div>

              {/* Categories */}
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-1 border transition ${
                      selectedCategory === cat.id
                        ? 'bg-black text-white dark:bg-white dark:text-black border-gray-300 dark:border-gray-600'
                        : 'bg-white dark:bg-black text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {getCategoryIcon(cat.name)}
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {products
                  .filter(product => !selectedCategory || product.category_id === selectedCategory)
                  .filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((product) => (
                    <div
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="border border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-black hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-black dark:text-white text-sm">{product.name}</h3>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                          {toNumber(product.price).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                      {product.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <button className="mt-2 w-full bg-black text-white dark:bg-white dark:text-black py-1.5 rounded-md border border-gray-300 dark:border-gray-600 hover:opacity-80 transition flex items-center justify-center gap-1">
                        <BiPlus className="h-4 w-4" /> Thêm
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right - Cart */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                    <BiCart className="h-5 w-5" />
                    Danh sách món đã gọi
                  </h3>
                </div>

                {activeCartItems.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Chưa có sản phẩm nào được gọi</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeCartItems.map((item, index) => {
                      const statusInfo = getStatusLabel(item.status);
                      return (
                        <div key={item.id || index} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-black dark:text-white text-sm">{item.product_name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <button
                                  onClick={() => item.id && updateCartItem(item.id, item.quantity - 1)}
                                  disabled={loading || !item.id}
                                  className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                  <BiMinus className="h-3 w-3" />
                                </button>
                                <span className="text-sm text-black dark:text-white">{toNumber(item.quantity)}</span>
                                <button
                                  onClick={() => item.id && updateCartItem(item.id, item.quantity + 1)}
                                  disabled={loading || !item.id}
                                  className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                  <BiPlus className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-black dark:text-white">
                                {toNumber(item.subtotal).toLocaleString('vi-VN')}đ
                              </p>

                            </div>
                          </div>
                          {item.id && item.status !== 'served' && (
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => removeCartItem(item.id!)}
                                className="text-red-500 dark:text-red-400 text-xs hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1"
                              >
                                <BiTrash className="h-3 w-3" /> Xóa
                              </button>
                              {item.status === 'preparing' && (
                                <button
                                  onClick={() => markItemAsServed(item.id!)}
                                  className="text-green-500 dark:text-green-400 text-xs hover:text-green-700 dark:hover:text-green-300 transition-colors flex items-center gap-1"
                                >
                                  ✓ Phục vụ
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {activeCartItems.length > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-black dark:text-white">Tạm tính:</span>
                      <span className="text-xl font-bold text-black dark:text-white">
                        {cartTotal.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      * Món ăn đã được gửi xuống bếp ngay khi thêm vào giỏ
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
