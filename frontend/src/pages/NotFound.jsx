import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-lg border border-slate-200 p-8 shadow-xs">
        <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">404 - Không Tìm Thấy Trang</h2>
        <p className="text-sm text-slate-500 mb-6">
          Địa chỉ yêu cầu không tồn tại trong hệ thống Smart Orthotic Insole Platform.
        </p>
        <Link
          to="/patients"
          className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-semibold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Quay Lại Bảng Điều Khiển
        </Link>
      </div>
    </div>
  );
};
