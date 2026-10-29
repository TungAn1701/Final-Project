import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, ROLES, DEMO_ACCOUNTS } from '../../context/AuthContext';
import {
  Activity,
  Shield,
  Radio,
  User,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginAsDemo, loading } = useAuth();

  const [selectedRole, setSelectedRole] = useState(ROLES.CLINICIAN);
  const [username, setUsername] = useState('dr_nguyen');
  const [password, setPassword] = useState('password123');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle role tab switch
  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === ROLES.CLINICIAN) {
      setUsername('dr_nguyen');
    } else if (role === ROLES.TECHNICIAN) {
      setUsername('tech_tran');
    } else {
      setUsername('patient_le');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên tài khoản hoặc mã nhân viên y tế.');
      return;
    }

    const result = await login(username, password, selectedRole);
    if (result.success) {
      const redirectPath =
        selectedRole === ROLES.CUSTOMER ? '/my-profile' : '/patients';
      navigate(location.state?.from?.pathname || redirectPath, { replace: true });
    } else {
      setErrorMsg(result.error || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
    }
  };

  const handleQuickDemoLogin = (account) => {
    loginAsDemo(account);
    const redirectPath =
      account.role === ROLES.CUSTOMER ? '/my-profile' : '/patients';
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-900 rounded-xl shadow-md text-teal-400 mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          HỆ THỐNG SMART ORTHOTIC INSOLE
        </h2>
        <p className="mt-1 text-sm text-slate-600 font-medium">
          Cổng Xác Thực Y Tế & Phân Quyền Lâm Sàng
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {/* Role Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Vai Trò Đăng Nhập (RBAC)
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => handleRoleChange(ROLES.CLINICIAN)}
                className={`py-2 px-2 rounded-md font-medium flex flex-col items-center justify-center transition ${
                  selectedRole === ROLES.CLINICIAN
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 mb-1 text-emerald-600" />
                <span>Bác Sĩ</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange(ROLES.TECHNICIAN)}
                className={`py-2 px-2 rounded-md font-medium flex flex-col items-center justify-center transition ${
                  selectedRole === ROLES.TECHNICIAN
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Radio className="w-4 h-4 mb-1 text-sky-600" />
                <span>Kỹ Thuật Viên</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange(ROLES.CUSTOMER)}
                className={`py-2 px-2 rounded-md font-medium flex flex-col items-center justify-center transition ${
                  selectedRole === ROLES.CUSTOMER
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4 mb-1 text-purple-600" />
                <span>Bệnh Nhân</span>
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tài khoản / Mã nhân viên
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Nhập tên đăng nhập"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md shadow-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-md shadow-xs text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-hidden transition disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xác thực JWT...</span>
              ) : (
                <>
                  <span>Đăng Nhập Hệ Thống</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Shortcuts */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Đăng nhập thử nghiệm nhanh:</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="space-y-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => handleQuickDemoLogin(acc)}
                  className="w-full text-left p-2 rounded border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-white transition flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900">{acc.displayName}</span>
                    <span className="text-slate-500 block text-[10px]">{acc.department}</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                    {acc.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          API Gateway: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">http://localhost:8000/api/v1/auth/login</code>
        </p>
      </div>
    </div>
  );
};
