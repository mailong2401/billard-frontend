'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { BiDrink, BiFoodMenu, BiShoppingBag, BiPlus, BiMinus, BiTrash, BiSearch } from 'react-icons/bi';
import { formatCurrency } from '@/utils/formatters';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  is_available: boolean;
  stock: number;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function MenuPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (socket && isConnected) {
      loadProducts();
      loadCategories();
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const handleProductCreated = (product: Product) => {
      if (product.is_available === true) {
        setProducts(prev => [product, ...prev]);
      }
    };

    const handleProductUpdated = (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    };

    const handleProductDeleted = ({ id }: { id: number }) => {
      setProducts(prev => prev.filter(p => p.id !== id));
    };

    socket.on('product-created', handleProductCreated);
    socket.on('product-updated', handleProductUpdated);
    socket.on('product-deleted', handleProductDeleted);

    return () => {
      socket.off('product-created', handleProductCreated);
      socket.off('product-updated', handleProductUpdated);
      socket.off('product-deleted', handleProductDeleted);
    };
  }, [socket]);

  const loadProducts = useCallback(() => {
    socket?.emit('get-products', {}, (res: any) => {
      console.log('Products from server:', res);
      if (res.success) {
        setProducts(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  const loadCategories = useCallback(() => {
    socket?.emit('get-categories', { is_active: true }, (res: any) => {
      if (res.success) {
        setCategories(res.data);
      }
    });
  }, [socket]);

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity <= 0) {
      error('Vui lòng chọn số lượng');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });

    success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`);
    setQuantities(prev => ({ ...prev, [product.id]: 0 }));
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeCartItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeCartItem = (productId: number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  const clearCart = () => {
    if (confirm('Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?')) {
      setCartItems([]);
      success('Đã xóa toàn bộ giỏ hàng');
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const filteredProducts = products.filter(product => {
    if (product.is_available !== true) return false;
    if (selectedCategory && product.category_id !== selectedCategory) return false;
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isConnected || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
          Thực đơn <span className="text-sky-600 dark:text-sky-400">Billiard Club</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Đa dạng đồ uống và thức ăn, phục vụ tận nơi
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-w-md mx-auto">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn, đồ uống..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white dark:bg-black text-slate-900 dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full transition-all ${
            selectedCategory === null
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Tất cả
        </button>
        {categories.filter(c => c.is_active === true).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === cat.id
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-black rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <BiFoodMenu className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <p className="text-slate-500 dark:text-slate-400">Không tìm thấy sản phẩm nào</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Hiện chưa có sản phẩm trong danh mục này'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Hiển thị {filteredProducts.length} sản phẩm
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                  className="bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="h-32 bg-gradient-to-r from-sky-100 to-sky-200 dark:from-sky-900/30 dark:to-sky-800/30 flex items-center justify-center">
                  {product.category_name?.includes('uống') ? (
                    <BiDrink className="h-16 w-16 text-sky-500 dark:text-sky-400" />
                  ) : (
                    <BiFoodMenu className="h-16 w-16 text-orange-500 dark:text-orange-400" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {product.category_name}
                      </p>
                    </div>
                    <span className="text-lg font-bold text-sky-600 dark:text-sky-400">
                      {formatCurrency(product.price)}
                    </span>
                  </div>



                  {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                      ⚠️ Còn {product.stock} sản phẩm
                    </p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                      ❌ Hết hàng
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        disabled={(quantities[product.id] || 0) <= 0 || product.stock === 0}
                      >
                        <BiMinus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                      <span className="w-8 text-center font-medium text-slate-900 dark:text-white">
                        {quantities[product.id] || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        className="p-1 rounded-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        disabled={product.stock === 0}
                      >
                        <BiPlus className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!quantities[product.id] || quantities[product.id] <= 0 || product.stock === 0}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all hover:scale-105 text-sm"
                    >
                      <BiShoppingBag className="h-4 w-4" />
                      <span>Thêm</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Cart Button */}
      {cartItems.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 bg-sky-600 hover:bg-sky-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 z-40"
        >
          <div className="relative">
            <BiShoppingBag className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
        </button>
      )}

      {/* Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Giỏ hàng ({cartItems.length} món)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Xóa tất cả
                </button>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
              {cartItems.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-8">
                  Giỏ hàng trống
                </p>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                        >
                          <BiMinus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-slate-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                          className="p-1 rounded bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                        >
                          <BiPlus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeCartItem(item.product.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <BiTrash className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex justify-between mb-4">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Tổng cộng:
                  </span>
                  <span className="text-xl font-bold text-sky-600 dark:text-sky-400">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    success('Đã gửi yêu cầu đặt món! Nhân viên sẽ phục vụ bạn ngay.');
                  }}
                  className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-lg font-semibold transition-all hover:scale-[1.02]"
                >
                  Đặt món
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
