'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 dark:border-sky-400 mx-auto mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Đang tải...</p>
      </div>
    </div>
  );
}
