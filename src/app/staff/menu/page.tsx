'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { BiSearch, BiDrink, BiFoodMenu } from 'react-icons/bi';
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
}

interface Category {
  id: number;
  name: string;
  is_active: boolean;
}

export default function StaffMenuPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ================= LOAD DATA =================
  const loadProducts = useCallback(() => {
    socket?.emit('get-products', { is_available: 1 }, (res: any) => {
      if (res.success) {
        setProducts(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  const loadCategories = useCallback(() => {
    socket?.emit('get-categories', { is_active: 1 }, (res: any) => {
      if (res.success) {
        setCategories(res.data);
      }
    });
  }, [socket]);

  // ================= REALTIME UPDATES =================
  useEffect(() => {
    if (!socket || !isClient) return;

    // Khi có sản phẩm mới được tạo
    const handleProductCreated = (product: Product) => {
      if (product.is_available === true) {
        setProducts(prev => [product, ...prev]);
        success(`Sản phẩm mới "${product.name}" đã được thêm`);
      }
    };

    // Khi sản phẩm được cập nhật
    const handleProductUpdated = (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      success(`Sản phẩm "${product.name}" đã được cập nhật`);
    };

    // Khi sản phẩm bị xóa
    const handleProductDeleted = ({ id }: { id: number }) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      success(`Sản phẩm đã được xóa`);
    };

    // Khi có danh mục mới
    const handleCategoryCreated = (category: Category) => {
      if (category.is_active) {
        setCategories(prev => [...prev, category]);
      }
    };

    // Khi danh mục được cập nhật
    const handleCategoryUpdated = (category: Category) => {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
    };

    // Khi danh mục bị xóa
    const handleCategoryDeleted = ({ id }: { id: number }) => {
      setCategories(prev => prev.filter(c => c.id !== id));
    };

    socket.on('product-created', handleProductCreated);
    socket.on('product-updated', handleProductUpdated);
    socket.on('product-deleted', handleProductDeleted);
    socket.on('category-created', handleCategoryCreated);
    socket.on('category-updated', handleCategoryUpdated);
    socket.on('category-deleted', handleCategoryDeleted);

    return () => {
      socket.off('product-created', handleProductCreated);
      socket.off('product-updated', handleProductUpdated);
      socket.off('product-deleted', handleProductDeleted);
      socket.off('category-created', handleCategoryCreated);
      socket.off('category-updated', handleCategoryUpdated);
      socket.off('category-deleted', handleCategoryDeleted);
    };
  }, [socket, isClient, success]);

  // Initial load
  useEffect(() => {
    if (isClient && socket && isConnected) {
      loadProducts();
      loadCategories();
    }
  }, [isClient, socket, isConnected, loadProducts, loadCategories]);

  const filteredProducts = products.filter(product => {
    if (selectedCategory && product.category_id !== selectedCategory) return false;
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (!isClient || !isConnected || loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-black dark:border-gray-700 dark:border-t-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-black dark:text-white mb-2">
          Thực đơn
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Danh sách đồ ăn, đồ uống
        </p>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm món ăn, đồ uống..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full transition-all ${
              selectedCategory === null
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Tất cả
          </button>
          {categories.filter(c => c.is_active).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full transition-all ${
                selectedCategory === cat.id
                  ? 'bg-black text-white dark:bg-white dark:text-black'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Không tìm thấy sản phẩm nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  {product.category_name?.includes('uống') ? (
                    <BiDrink className="h-16 w-16 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <BiFoodMenu className="h-16 w-16 text-orange-500 dark:text-orange-400" />
                  )}
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-black dark:text-white">{product.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.category_name}</p>
                    </div>
                    <span className="text-lg font-bold text-black dark:text-white">
                      {formatCurrency(product.price)}
                    </span>
                  </div>
                  {product.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400">⚠️ Còn {product.stock} sản phẩm</p>
                  )}
                  {product.stock === 0 && (
                    <p className="text-xs text-red-600 dark:text-red-400">❌ Hết hàng</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
