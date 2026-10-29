import axiosClient from './axiosClient';

export const authApi = {
  // Login endpoint: POST /api/v1/auth/login
  login: async (username, password, role = 'CLINICIAN') => {
    const response = await axiosClient.post('/auth/login', {
      username,
      password,
      role: role.toUpperCase(),
    });
    return response.data;
  },

  // Validate token: GET /api/v1/auth/validate
  validateToken: async (token) => {
    const response = await axiosClient.get(`/auth/validate?token=${token}`);
    return response.data;
  },

  // Health check endpoint
  checkGatewayHealth: async () => {
    try {
      const response = await axiosClient.get('/health', { baseURL: '' });
      return response.data;
    } catch {
      return { status: 'OFFLINE' };
    }
  },
};
