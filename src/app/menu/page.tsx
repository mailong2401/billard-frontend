'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import Header from '@/components/client/Header';
import { formatCurrency } from '@/utils/formatters';
import { BiCoffee, BiFoodMenu, BiBeer, BiAddToQueue } from 'react-icons/bi';

interface Product {
  id: number;
  name: string;
  price: number;
  category_id: number;
  description?: string;
  image?: string;
}

interface Category {
  id: number;
  name: string;
}

export default function ClientMenu() {
  const { socket, isConnected } = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && socket && isConnected) {
      // Load categories
      socket?.emit('get-categories', {}, (res: any) => {
        if (res.success) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setSelectedCategory(res.data[0].id);
          }
        }
      });

      // Load products
      socket?.emit('get-products', {}, (res: any) => {
        if (res.success) {
          setProducts(res.data);
        }
        setLoading(false);
      });
    }
  }, [isClient, socket, isConnected]);

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'đồ uống':
      case 'drinks':
        return <BiCoffee className="h-5 w-5" />;
      case 'đồ ăn':
      case 'food':
        return <BiFoodMenu className="h-5 w-5" />;
      case 'bia':
      case 'beer':
        return <BiBeer className="h-5 w-5" />;
      default:
        return <BiAddToQueue className="h-5 w-5" />;
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  if (!isClient || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
        <Header />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-macchiato-base">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-macchiato-text mb-2">
          Menu
        </h1>
        <p className="text-gray-600 dark:text-macchiato-subtext mb-6">
          Đồ ăn và thức uống đa dạng
        </p>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 mb-6 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-macchiato-surface text-gray-700 dark:text-macchiato-text hover:bg-gray-100 dark:hover:bg-macchiato-mantle'
              }`}
            >
              {getCategoryIcon(category.name)}
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-macchiato-surface rounded-lg">
            <p className="text-gray-500 dark:text-macchiato-subtext">
              Không có sản phẩm nào trong danh mục này
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-macchiato-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-macchiato-text mb-2">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 dark:text-macchiato-subtext mb-3">
                      {product.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary-600">
                      {formatCurrency(product.price)}
                    </span>
                    <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition">
                      Đặt món
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
