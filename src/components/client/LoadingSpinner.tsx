'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-macchiato-subtext">Đang kết nối...</p>
      </div>
    </div>
  );
}
