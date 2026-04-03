"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/useToast";
import {
  BiPlus,
  BiEdit,
  BiTrash,
  BiSearch,
  BiCart,
  BiDollar,
} from "react-icons/bi";
import ProductModal from "@/components/admin/products/ProductModal";
import CategoryModal from "@/components/admin/products/CategoryModal";

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
  description: string;
  sort_order: number;
  is_active: boolean;
}

// Product Card Component với hiệu ứng lật giống TableCard
const ProductCard = ({ product, onEdit, onDelete, formatPrice }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative w-full h-full min-h-[320px] cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full transition-all duration-500 preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
      >
        {/* Mặt trước - Thông tin cơ bản */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-black rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          {/* Góc trên bên trái - Danh mục */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 rounded-md text-xl font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {product.category_name}
            </span>
          </div>

          {/* Trạng thái - góc trên bên phải */}
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-full text-xl font-medium ${
                product.is_available
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {product.is_available ? "Đang bán" : "Ngừng bán"}
            </span>
          </div>

          {/* Nội dung chính giữa */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-4">
              <h3 className="text-2xl font-bold text-black dark:text-white mb-2">
                {product.name}
              </h3>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Thông tin tồn kho */}
            {product.stock !== undefined && product.stock <= 10 && (
              <div className="text-center">
                {product.stock > 0 ? (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ Còn {product.stock} sản phẩm
                  </p>
                ) : (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    ❌ Hết hàng
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mặt sau - Chi tiết đầy đủ */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-black rounded-lg shadow-md border border-gray-200 dark:border-gray-800 p-5 flex flex-col rotate-y-180 overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-black dark:text-white">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {product.category_name}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                product.is_available
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              }`}
            >
              {product.is_available ? "Đang bán" : "Ngừng bán"}
            </span>
          </div>

          {/* Mô tả */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {product.description || "Không có mô tả"}
            </p>
          </div>

          {/* Thông tin giá và tồn kho */}
          <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Giá bán:
              </span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Tồn kho:
              </span>
              <span
                className={`font-medium ${product.stock === 0 ? "text-red-600" : "text-black dark:text-white"}`}
              >
                {product.stock} sản phẩm
              </span>
            </div>
          </div>

          {/* Nút chức năng */}
          <div className="mt-auto flex space-x-2">
            <button
              onClick={() => onEdit(product)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-black dark:text-white bg-white dark:bg-black border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-[1.02] active:scale-95"
            >
              <BiEdit className="h-4 w-4" />
              <span>Sửa</span>
            </button>
            <button
              onClick={() => onDelete(product.id)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-black border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              <BiTrash className="h-4 w-4" />
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProductsPage() {
  const { socket, isConnected } = useSocket();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    if (socket && isConnected) {
      loadProducts();
      loadCategories();
    }
  }, [socket, isConnected]);

  useEffect(() => {
    if (!socket) return;

    const handleProductCreated = (product: Product) => {
      setProducts((prev) => [product, ...prev]);
      success("Sản phẩm mới đã được thêm");
    };

    const handleProductUpdated = (product: Product) => {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? product : p)),
      );
      success("Sản phẩm đã được cập nhật");
    };

    const handleProductDeleted = ({ id }: { id: number }) => {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      success("Sản phẩm đã được xóa");
    };

    const handleCategoryCreated = (category: Category) => {
      setCategories((prev) => [...prev, category]);
      success("Danh mục mới đã được thêm");
    };

    const handleCategoryUpdated = (category: Category) => {
      setCategories((prev) =>
        prev.map((c) => (c.id === category.id ? category : c)),
      );
      success("Danh mục đã được cập nhật");
    };

    const handleCategoryDeleted = ({ id }: { id: number }) => {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      success("Danh mục đã được xóa");
    };

    socket.on("product-created", handleProductCreated);
    socket.on("product-updated", handleProductUpdated);
    socket.on("product-deleted", handleProductDeleted);
    socket.on("category-created", handleCategoryCreated);
    socket.on("category-updated", handleCategoryUpdated);
    socket.on("category-deleted", handleCategoryDeleted);

    return () => {
      socket.off("product-created", handleProductCreated);
      socket.off("product-updated", handleProductUpdated);
      socket.off("product-deleted", handleProductDeleted);
      socket.off("category-created", handleCategoryCreated);
      socket.off("category-updated", handleCategoryUpdated);
      socket.off("category-deleted", handleCategoryDeleted);
    };
  }, [socket, success]);

  const loadProducts = useCallback(() => {
    socket?.emit("get-products", {}, (res: any) => {
      if (res.success) {
        setProducts(res.data);
      }
      setLoading(false);
    });
  }, [socket]);

  const loadCategories = useCallback(() => {
    socket?.emit("get-categories", {}, (res: any) => {
      if (res.success) {
        setCategories(res.data);
      }
    });
  }, [socket]);

  const handleCreateProduct = (data: any) => {
    socket?.emit("create-product", data, (res: any) => {
      if (res.success) {
        setIsProductModalOpen(false);
        loadProducts();
      } else {
        error(res.error);
      }
    });
  };

  const handleUpdateProduct = (data: any) => {
    socket?.emit(
      "update-product",
      { id: editingProduct?.id, ...data },
      (res: any) => {
        if (res.success) {
          setIsProductModalOpen(false);
          setEditingProduct(null);
          loadProducts();
        } else {
          error(res.error);
        }
      },
    );
  };

  const handleDeleteProduct = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    socket?.emit("delete-product", { id }, (res: any) => {
      if (res.success) {
        loadProducts();
      } else {
        error(res.error);
      }
    });
  };

  const handleCreateCategory = (data: any) => {
    socket?.emit("create-category", data, (res: any) => {
      if (res.success) {
        setIsCategoryModalOpen(false);
        loadCategories();
      } else {
        error(res.error);
      }
    });
  };

  const handleUpdateCategory = (data: any) => {
    socket?.emit(
      "update-category",
      { id: editingCategory?.id, ...data },
      (res: any) => {
        if (res.success) {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
          loadCategories();
        } else {
          error(res.error);
        }
      },
    );
  };

  const handleDeleteCategory = (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;
    socket?.emit("delete-category", { id }, (res: any) => {
      if (res.success) {
        loadCategories();
      } else {
        error(res.error);
      }
    });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || product.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!isConnected) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            Đang kết nối đến server...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Quản lý sản phẩm
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý danh sách đồ ăn, đồ uống và danh mục
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all shadow-sm hover:shadow-md"
          >
            <BiPlus size={20} />
            <span>Thêm danh mục</span>
          </button>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-all shadow-sm hover:shadow-md"
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
                ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Tất cả
          </button>
          {categories
            .filter((c) => c.is_active === true)
            .map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
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
          <BiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-black text-black dark:text-white transition-colors"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-black rounded-lg shadow-md border border-gray-200 dark:border-gray-800">
          <div className="flex flex-col items-center">
            <BiSearch className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Không tìm thấy sản phẩm nào
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Thử tìm kiếm với từ khóa khác
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={(p: Product) => {
                setEditingProduct(p);
                setIsProductModalOpen(true);
              }}
              onDelete={handleDeleteProduct}
              formatPrice={formatPrice}
            />
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

      <style jsx global>{`
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
    </div>
  );
}
