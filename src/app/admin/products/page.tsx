'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/hooks/useToast';
import { BiPlus, BiEdit, BiTrash, BiSearch } from 'react-icons/bi';
import ProductModal from '@/components/products/ProductModal';
import CategoryModal from '@/components/products/CategoryModal';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  is_available: boolean;  // boolean, không phải number
  stock: number;
  image_url?: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
  sort_order: number;
  is_active: boolean;  // boolean
}

export default function ProductsPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (socket && isConnected) {
      loadProducts();
      loadCategories();
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const handleProductCreated = (product: Product) => {
      setProducts(prev => [product, ...prev]);
      success('Sản phẩm mới đã được thêm');
    };

    const handleProductUpdated = (product: Product) => {
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
      success('Sản phẩm đã được cập nhật');
    };

    const handleProductDeleted = ({ id }: { id: number }) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      success('Sản phẩm đã được xóa');
    };

    const handleCategoryCreated = (category: Category) => {
      setCategories(prev => [...prev, category]);
      success('Danh mục mới đã được thêm');
    };

    const handleCategoryUpdated = (category: Category) => {
      setCategories(prev => prev.map(c => c.id === category.id ? category : c));
      success('Danh mục đã được cập nhật');
    };

    const handleCategoryDeleted = ({ id }: { id: number }) => {
      setCategories(prev => prev.filter(c => c.id !== id));
      success('Danh mục đã được xóa');
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
  }, [socket, success]);

  const loadProducts = useCallback(() => {
    socket?.emit('get-products', {}, (res: any) => {
      if (res.success) {
        setProducts(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  const loadCategories = useCallback(() => {
    socket?.emit('get-categories', {}, (res: any) => {
      if (res.success) {
        setCategories(res.data);
      }
    });
  }, [socket]);

  const handleCreateProduct = (data: any) => {
    socket?.emit('create-product', data, (res: any) => {
      if (res.success) {
        setIsProductModalOpen(false);
        loadProducts();
      } else {
        error(res.error);
      }
    });
  };

  const handleUpdateProduct = (data: any) => {
    socket?.emit('update-product', { id: editingProduct?.id, ...data }, (res: any) => {
      if (res.success) {
        setIsProductModalOpen(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        error(res.error);
      }
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    socket?.emit('delete-product', { id }, (res: any) => {
      if (res.success) {
        loadProducts();
      } else {
        error(res.error);
      }
    });
  };

  const handleCreateCategory = (data: any) => {
    socket?.emit('create-category', data, (res: any) => {
      if (res.success) {
        setIsCategoryModalOpen(false);
        loadCategories();
      } else {
        error(res.error);
      }
    });
  };

  const handleUpdateCategory = (data: any) => {
    socket?.emit('update-category', { id: editingCategory?.id, ...data }, (res: any) => {
      if (res.success) {
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        loadCategories();
      } else {
        error(res.error);
      }
    });
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    socket?.emit('delete-category', { id }, (res: any) => {
      if (res.success) {
        loadCategories();
      } else {
        error(res.error);
      }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-macchiato-blue mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-macchiato-subtext">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text">Quản lý sản phẩm</h1>
          <p className="text-gray-600 dark:text-macchiato-subtext mt-1">Quản lý danh sách đồ ăn, đồ uống và danh mục</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
          >
            <BiPlus size={20} />
            <span>Thêm danh mục</span>
          </button>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-md"
          >
            <BiPlus size={20} />
            <span>Thêm sản phẩm</span>
          </button>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-macchiato-surface text-gray-700 dark:text-macchiato-subtext hover:bg-gray-200 dark:hover:bg-macchiato-overlay'
            }`}
          >
            Tất cả
          </button>
          {categories.filter(c => c.is_active === true).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-macchiato-surface text-gray-700 dark:text-macchiato-subtext hover:bg-gray-200 dark:hover:bg-macchiato-overlay'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-macchiato-subtext h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-macchiato-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-macchiato-base text-gray-900 dark:text-macchiato-text transition-colors"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-macchiato-blue"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-macchiato-base rounded-lg shadow-md">
          <div className="flex flex-col items-center">
            <BiSearch className="h-16 w-16 text-gray-300 dark:text-macchiato-subtext mb-4" />
            <p className="text-gray-500 dark:text-macchiato-subtext">Không tìm thấy sản phẩm nào</p>
            <p className="text-sm text-gray-400 dark:text-macchiato-subtext/70 mt-1">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="bg-white dark:bg-macchiato-base rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-macchiato-subtext">
                      {product.category_name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.is_available === true
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-macchiato-surface text-gray-700 dark:text-macchiato-subtext'
                  }`}>
                    {product.is_available === true ? '✅ Đang bán' : '❌ Ngừng bán'}
                  </span>
                </div>
                
                {product.description && (
                  <p className="text-sm text-gray-600 dark:text-macchiato-subtext mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-macchiato-surface">
                  <div>
                    <span className="text-xl font-bold text-primary-600 dark:text-macchiato-blue">
                      {product.price.toLocaleString('vi-VN')}đ
                    </span>
                    {product.stock !== undefined && product.stock < 10 && (
                      <p className="text-xs text-orange-500 mt-1">
                        Còn {product.stock} sản phẩm
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsProductModalOpen(true);
                      }}
                      className="p-2 text-blue-600 dark:text-macchiato-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all hover:scale-110"
                      title="Sửa"
                    >
                      <BiEdit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 dark:text-macchiato-red hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all hover:scale-110"
                      title="Xóa"
                    >
                      <BiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
        categories={categories}
        product={editingProduct}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={editingCategory ? handleUpdateCategory : handleCreateCategory}
        category={editingCategory}
      />
    </div>
  );
}
