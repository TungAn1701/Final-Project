import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const ROLES = {
  CLINICIAN: 'CLINICIAN',
  TECHNICIAN: 'TECHNICIAN',
  CUSTOMER: 'CUSTOMER',
};

// Preset demo accounts for fast clinical evaluation & testing
export const DEMO_ACCOUNTS = [
  {
    username: 'dr_nguyen',
    role: ROLES.CLINICIAN,
    displayName: 'BS. CKII Nguyễn Văn An',
    department: 'Khoa Phục hồi Chức năng & Chỉnh hình',
    avatar: '👨‍⚕️',
    token: 'demo-jwt-clinician-token-ortho-2026',
    customerId: null,
  },
  {
    username: 'tech_tran',
    role: ROLES.TECHNICIAN,
    displayName: 'KTV. Trần Minh Đức',
    department: 'Phòng Đo Dáng Đi & Cảm biến FSR',
    avatar: '🔬',
    token: 'demo-jwt-technician-token-ortho-2026',
    customerId: null,
  },
  {
    username: 'patient_le',
    role: ROLES.CUSTOMER,
    displayName: 'Lê Hoàng Nam (Bệnh nhân)',
    department: 'Mã hồ sơ: CUST-8801',
    avatar: '🏃',
    token: 'demo-jwt-patient-token-ortho-2026',
    customerId: 'CUST-8801',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('insole_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('insole_access_token') || null);
  const [loading, setLoading] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState('CHECKING'); // UP | OFFLINE | CHECKING

  // Check Gateway health status periodically
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await authApi.checkGatewayHealth();
        if (res && (res.status === 'UP' || res.service === 'api-gateway')) {
          setGatewayStatus('UP');
        } else {
          setGatewayStatus('OFFLINE');
        }
      } catch {
        setGatewayStatus('OFFLINE');
      }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Standard Login function via Gateway / API
  const login = async (username, password, role = ROLES.CLINICIAN) => {
    setLoading(true);
    try {
      const data = await authApi.login(username, password, role);
      const userObj = {
        username: data.username || username,
        role: data.role ? data.role.toUpperCase() : role,
        displayName:
          role === ROLES.CLINICIAN
            ? `BS. ${username}`
            : role === ROLES.TECHNICIAN
            ? `KTV. ${username}`
            : `Bệnh nhân: ${username}`,
        department:
          role === ROLES.CLINICIAN
            ? 'Bác sĩ Chỉnh hình'
            : role === ROLES.TECHNICIAN
            ? 'Kỹ thuật viên Thiết bị'
            : 'Khách hàng',
        customerId: role === ROLES.CUSTOMER ? 'CUST-8801' : null,
      };

      setToken(data.accessToken);
      setUser(userObj);
      localStorage.setItem('insole_access_token', data.accessToken);
      localStorage.setItem('insole_user', JSON.stringify(userObj));
      return { success: true, user: userObj };
    } catch (err) {
      console.error('Lỗi xác thực đăng nhập API:', err);
      const errMsg =
        err.response?.status === 401
          ? 'Tên đăng nhập hoặc mật khẩu không chính xác.'
          : err.response?.status === 400
          ? 'Yêu cầu đăng nhập không hợp lệ.'
          : 'Không thể kết nối đến máy chủ Gateway (Port 8000). Vui lòng thử lại hoặc dùng chế độ Demo.';
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Quick switch between Demo Roles (Clinician, Technician, Customer)
  const loginAsDemo = (demoAccount) => {
    const userObj = {
      username: demoAccount.username,
      role: demoAccount.role,
      displayName: demoAccount.displayName,
      department: demoAccount.department,
      customerId: demoAccount.customerId,
    };
    setToken(demoAccount.token);
    setUser(userObj);
    localStorage.setItem('insole_access_token', demoAccount.token);
    localStorage.setItem('insole_user', JSON.stringify(userObj));
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('insole_access_token');
    localStorage.removeItem('insole_user');
  };

  // Role Checker
  const hasRole = (allowedRoles) => {
    if (!user || !user.role) return false;
    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }
    return user.role === allowedRoles;
  };

  const isClinician = user?.role === ROLES.CLINICIAN;
  const isTechnician = user?.role === ROLES.TECHNICIAN;
  const isCustomer = user?.role === ROLES.CUSTOMER;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        gatewayStatus,
        login,
        loginAsDemo,
        logout,
        hasRole,
        isClinician,
        isTechnician,
        isCustomer,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
