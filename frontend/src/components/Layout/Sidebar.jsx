import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Footprints,
  Activity,
  UserCheck,
  Server,
  Database,
  Check,
  XCircle,
  Shield,
  Radio,
  User
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isCustomer, isClinician, isTechnician } = useAuth();

  const navClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive
        ? 'bg-slate-900 text-white shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 shrink-0">
      <div>
        {/* Navigation Section */}
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          {isCustomer ? 'Cổng Thông Tin Bệnh Nhân' : 'Chức Năng Lâm Sàng'}
        </div>

        <nav className="space-y-1">
          {/* Clinician / Technician Menu */}
          {!isCustomer && (
            <>
              <NavLink to="/patients" className={navClass}>
                <Users className="w-4 h-4 text-slate-500" />
                <span>Hồ Sơ Bệnh Nhân</span>
              </NavLink>

              <NavLink to="/sessions" className={navClass}>
                <Footprints className="w-4 h-4 text-slate-500" />
                <span>Phiên Đo Dáng Đi</span>
              </NavLink>
            </>
          )}

          {/* Customer / Patient Menu */}
          {isCustomer && (
            <NavLink to="/my-profile" className={navClass}>
              <UserCheck className="w-4 h-4 text-slate-500" />
              <span>Hồ Sơ & Lịch Sử Đo</span>
            </NavLink>
          )}
        </nav>

        {/* Role Permissions Card */}
        <div className="mt-8 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <div className="font-semibold text-slate-800 flex items-center justify-between mb-2 pb-1.5 border-b border-slate-200/80">
            <span className="flex items-center">
              {isClinician && <Shield className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />}
              {isTechnician && <Radio className="w-3.5 h-3.5 text-sky-600 mr-1.5" />}
              {isCustomer && <User className="w-3.5 h-3.5 text-purple-600 mr-1.5" />}
              <span>Quyền Hạn Thao Tác</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-white rounded border border-slate-200 font-bold text-slate-700">
              {user?.role}
            </span>
          </div>

          <ul className="space-y-1.5 text-slate-600 text-[11px] leading-relaxed">
            {isClinician && (
              <>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Toàn quyền Thêm / Sửa / Xóa bệnh nhân</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Bắt đầu phiên đo & chẩn đoán dáng đi</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Chỉ định thông số kê toa lót giày</span>
                </li>
              </>
            )}

            {isTechnician && (
              <>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Xem danh sách & thêm mới hồ sơ</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Vận hành thu thập cảm biến FSR 50Hz</span>
                </li>
                <li className="flex items-start text-rose-600 font-medium">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mr-1.5 mt-0.5" />
                  <span>Không có quyền xóa bệnh án (Ẩn nút xóa)</span>
                </li>
              </>
            )}

            {isCustomer && (
              <>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Xem thông số áp lực bàn chân cá nhân</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mr-1.5 mt-0.5" />
                  <span>Theo dõi kết quả tiến triển dáng đi</span>
                </li>
                <li className="flex items-start text-rose-600 font-medium">
                  <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mr-1.5 mt-0.5" />
                  <span>Chỉ xem hồ sơ của mình (Không truy cập BN khác)</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Backend Microservice Architecture Footer Info */}
      <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-slate-600">
            <Server className="w-3 h-3 mr-1 text-slate-400" /> Gateway:
          </span>
          <span className="font-mono text-slate-700">Port 8000</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-slate-600">
            <Database className="w-3 h-3 mr-1 text-slate-400" /> Khách hàng DB:
          </span>
          <span className="font-mono text-slate-700">Port 8082</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-slate-600">
            <Activity className="w-3 h-3 mr-1 text-slate-400" /> FSR Ingest WS:
          </span>
          <span className="font-mono text-slate-700">Port 8081</span>
        </div>
      </div>
    </aside>
  );
};
