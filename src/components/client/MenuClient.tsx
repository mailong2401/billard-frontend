'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { BiCoffee, BiFoodMenu, BiDrink, BiShoppingBag, BiPlus, BiMinus } from 'react-icons/bi';
import Image from 'next/image';
import { formatCurrency } from '@/utils/formatters';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  is_available: number;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  sort_order: number;
}

interface MenuClientProps {
  onAddToCart?: (product: Product, quantity: number) => void;
}

export default function MenuClient({ onAddToCart }: MenuClientProps) {
  const { socket, isConnected } = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    if (socket && isConnected) {
      loadProducts();
      loadCategories();
    }
  }, [socket, isConnected]);

  const loadProducts = () => {
    socket?.emit('get-products', { is_available: 1 }, (res: any) => {
      if (res.success) {
        setProducts(res.data);
      }
      setLoading(false);
    });
  };

  const loadCategories = () => {
    socket?.emit('get-categories', { is_active: 1 }, (res: any) => {
      if (res.success) {
        setCategories(res.data);
      }
    });
  };

  const updateQuantity = (productId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) + delta)
    }));
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > 0) {
      onAddToCart?.(product, quantity);
      setQuantities(prev => ({ ...prev, [product.id]: 0 }));
    }
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category_id !== selectedCategory) return false;
    if (product.is_available !== 1) return false;
    return true;
  });

  // Dữ liệu mẫu cho các món (fallback khi không có data từ server)
  const sampleProducts: Product[] = [
    {
      id: 1,
      name: 'Coca Cola',
      description: 'Nước ngọt có gas, giải khát tuyệt vời',
      price: 15000,
      category_id: 1,
      category_name: 'Đồ uống',
      is_available: 1
    },
    {
      id: 2,
      name: 'Pepsi',
      description: 'Nước ngọt có gas, thơm ngon',
      price: 15000,
      category_id: 1,
      category_name: 'Đồ uống',
      is_available: 1
    },
    {
      id: 3,
      name: 'Bia Tiger',
      description: 'Bia chai, thơm ngon đậm đà',
      price: 25000,
      category_id: 1,
      category_name: 'Đồ uống',
      is_available: 1
    },
    {
      id: 4,
      name: 'Mì tôm',
      description: 'Mì tôm trứng, nóng hổi',
      price: 20000,
      category_id: 2,
      category_name: 'Đồ ăn',
      is_available: 1
    },
    {
      id: 5,
      name: 'Bánh mì thịt nướng',
      description: 'Bánh mì giòn, thịt nướng thơm lừng',
      price: 25000,
      category_id: 2,
      category_name: 'Đồ ăn',
      is_available: 1
    },
    {
      id: 6,
      name: 'Khoai tây chiên',
      description: 'Khoai tây chiên giòn, sốt cà chua',
      price: 30000,
      category_id: 2,
      category_name: 'Đồ ăn',
      is_available: 1
    },
    {
      id: 7,
      name: 'Nước suối',
      description: 'Nước suối tinh khiết',
      price: 10000,
      category_id: 1,
      category_name: 'Đồ uống',
      is_available: 1
    },
    {
      id: 8,
      name: 'Trà đào',
      description: 'Trà đào thơm ngon, mát lạnh',
      price: 20000,
      category_id: 1,
      category_name: 'Đồ uống',
      is_available: 1
    }
  ];

  const displayProducts = products.length > 0 ? filteredProducts : sampleProducts;
  const displayCategories = categories.length > 0 ? categories : [
    { id: 1, name: 'Đồ uống', sort_order: 1 },
    { id: 2, name: 'Đồ ăn', sort_order: 2 }
  ];

  if (!isConnected || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-macchiato-subtext">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text mb-2">
          Thực đơn <span className="text-primary-600">Billiard Club</span>
        </h2>
        <p className="text-gray-600 dark:text-macchiato-subtext">
          Đa dạng đồ uống và thức ăn, phục vụ tận nơi
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full transition-all ${
            selectedCategory === null
              ? 'bg-primary-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-macchiato-surface text-gray-700 dark:text-macchiato-subtext hover:bg-gray-200 dark:hover:bg-macchiato-overlay'
          }`}
        >
          Tất cả
        </button>
        {displayCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-macchiato-surface text-gray-700 dark:text-macchiato-subtext hover:bg-gray-200 dark:hover:bg-macchiato-overlay'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-macchiato-surface rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Product Image Placeholder */}
            <div className="h-32 bg-gradient-to-r from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
              {product.category_name === 'Đồ uống' ? (
                <BiDrink className="h-16 w-16 text-primary-500" />
              ) : (
                <BiFoodMenu className="h-16 w-16 text-orange-500" />
              )}
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-macchiato-text">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-macchiato-subtext">
                    {product.category_name}
                  </p>
                </div>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(product.price)}
                </span>
              </div>

              {product.description && (
                <p className="text-sm text-gray-600 dark:text-macchiato-subtext mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-macchiato-mantle">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="p-1 rounded-full bg-gray-100 dark:bg-macchiato-mantle hover:bg-gray-200 dark:hover:bg-macchiato-overlay transition-colors"
                    disabled={(quantities[product.id] || 0) <= 0}
                  >
                    <BiMinus className="h-4 w-4 text-gray-600 dark:text-macchiato-subtext" />
                  </button>
                  <span className="w-8 text-center font-medium text-gray-900 dark:text-macchiato-text">
                    {quantities[product.id] || 0}
                  </span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="p-1 rounded-full bg-gray-100 dark:bg-macchiato-mantle hover:bg-gray-200 dark:hover:bg-macchiato-overlay transition-colors"
                  >
                    <BiPlus className="h-4 w-4 text-gray-600 dark:text-macchiato-subtext" />
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!quantities[product.id] || quantities[product.id] <= 0}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-all hover:scale-105 text-sm"
                >
                  <BiShoppingBag className="h-4 w-4" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {displayProducts.length === 0 && (
        <div className="text-center py-12">
          <BiCoffee className="h-16 w-16 text-gray-300 dark:text-macchiato-subtext mx-auto mb-4" />
          <p className="text-gray-500 dark:text-macchiato-subtext">Hiện chưa có sản phẩm nào</p>
        </div>
      )}
    </div>
  );
}
