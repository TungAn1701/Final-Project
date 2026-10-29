import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES, DEMO_ACCOUNTS } from '../../context/AuthContext';
import {
  Activity,
  LogOut,
  ChevronDown,
  Shield,
  Radio,
  User,
  CheckCircle2
} from 'lucide-react';

export const TopBar = () => {
  const { user, logout, loginAsDemo, gatewayStatus } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = (acc) => {
    loginAsDemo(acc);
    setShowRoleMenu(false);
    // Automatically redirect to the appropriate workspace based on the new role
    if (acc.role === ROLES.CUSTOMER) {
      navigate('/my-profile');
    } else {
      if (location.pathname === '/my-profile' || location.pathname === '/') {
        navigate('/patients');
      }
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case ROLES.CLINICIAN:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="w-3 h-3 mr-1" /> Bác Sĩ Lâm Sàng
          </span>
        );
      case ROLES.TECHNICIAN:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Radio className="w-3 h-3 mr-1" /> Kỹ Thuật Viên
          </span>
        );
      case ROLES.CUSTOMER:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <User className="w-3 h-3 mr-1" /> Bệnh Nhân / KH
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{role}</span>;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-6 flex items-center justify-between shadow-xs">
      {/* Brand & System Title */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 bg-slate-900 rounded-md flex items-center justify-center text-white shadow-xs">
          <Activity className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              SMART ORTHOTIC INSOLE
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200 font-semibold">
              v2.1 EMR
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Hệ Thống Phân Tích Dáng Đi & Thiết Kế Lót Giày Y Tế
          </p>
        </div>
      </div>

      {/* Center: Microservice Status */}
      <div className="hidden md:flex items-center space-x-4 text-xs">
        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 rounded border border-slate-200 text-slate-600">
          <span className="text-slate-400 font-mono">Gateway :8000</span>
          {gatewayStatus === 'UP' ? (
            <span className="inline-flex items-center text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1"></span> Sẵn sàng
            </span>
          ) : (
            <span className="inline-flex items-center text-amber-600 font-medium" title="Gateway demo fallback">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1"></span> Kết nối cục bộ
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-50 rounded border border-slate-200 text-slate-600">
          <span className="text-slate-400 font-mono">Bảo mật:</span>
          <span className="text-slate-700 font-mono font-medium">Spring JWT Stateless</span>
        </div>
      </div>

      {/* Right Controls: Role Switcher Demo & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Quick Role Switcher for Testing RBAC */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center space-x-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded transition border border-slate-200"
            title="Nhấn để đổi vai trò thử nghiệm phân quyền"
          >
            <span>Phân quyền:</span>
            {getRoleBadge(user?.role)}
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1 w-64 bg-white rounded-md shadow-lg border border-slate-200 py-2 z-50 text-xs">
              <div className="px-3 py-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100">
                Chuyển đổi vai trò thử nghiệm
              </div>
              {DEMO_ACCOUNTS.map((acc) => {
                const isCurrent = user?.username === acc.username;
                return (
                  <button
                    key={acc.username}
                    onClick={() => handleRoleSwitch(acc)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition ${
                      isCurrent ? 'bg-slate-50 font-semibold' : ''
                    }`}
                  >
                    <div>
                      <div className="text-slate-900 font-medium">{acc.displayName}</div>
                      <div className="text-[11px] text-slate-500">{acc.department}</div>
                    </div>
                    {isCurrent && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Card */}
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-xs font-semibold text-slate-900">{user?.displayName}</span>
          <span className="text-[11px] text-slate-500">{user?.department}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
          title="Đăng xuất"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
