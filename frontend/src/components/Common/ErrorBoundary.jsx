import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleLogout = () => {
    localStorage.removeItem('insole_access_token');
    localStorage.removeItem('insole_user');
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Đã Xảy Ra Lỗi Giao Diện</h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Hệ thống ghi nhận sự cố khi dựng trang. Bạn có thể tải lại trang hoặc đăng xuất để khởi tạo lại phiên làm việc.
            </p>
            {this.state.error?.message && (
              <pre className="text-left text-[11px] font-mono bg-slate-100 p-3 rounded-md text-rose-700 overflow-x-auto mb-6 max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Tải lại trang
              </button>
              <button
                onClick={this.handleLogout}
                className="inline-flex items-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md transition border border-slate-300"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" /> Về trang đăng nhập
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
