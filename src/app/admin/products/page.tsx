"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useToast } from "@/hooks/useToast";
import { BiPlus, BiEdit, BiTrash, BiSearch } from "react-icons/bi";
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
            <div
              key={product.id}
              className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-200 dark:border-gray-800 flex flex-col h-full"
            >
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {product.category_name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ml-2 ${
                      product.is_available === true
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {product.is_available === true ? "Đang bán" : "Ngừng bán"}
                  </span>
                </div>

                {/* Fixed height for description area */}
                <div className="min-h-[60px] mb-3">
                  {product.description ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                      Không có mô tả
                    </p>
                  )}
                </div>

                {/* Push bottom content to the bottom */}
                <div className="mt-auto">
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-xl font-bold text-black dark:text-white">
                        {formatPrice(product.price)}
                      </span>
                      {product.stock !== undefined &&
                        product.stock < 10 &&
                        product.stock > 0 && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ⚠️ Còn {product.stock} sản phẩm
                          </p>
                        )}
                      {product.stock === 0 && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          ❌ Hết hàng
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setIsProductModalOpen(true);
                        }}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-all hover:scale-110"
                        title="Sửa"
                      >
                        <BiEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/20 rounded-lg transition-all hover:scale-110"
                        title="Xóa"
                      >
                        <BiTrash className="h-5 w-5" />
                      </button>
                    </div>
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
