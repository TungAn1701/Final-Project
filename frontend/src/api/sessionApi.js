import axiosClient from './axiosClient';

export const sessionApi = {
  // Get all gait sessions across all customers
  getAllSessions: async () => {
    const response = await axiosClient.get('/sessions');
    return response.data;
  },

  // Get all gait sessions of a specific customer
  getCustomerSessions: async (customerId) => {
    const response = await axiosClient.get(`/customers/${customerId}/sessions`);
    return response.data;
  },

  // Get specific session details
  getSessionById: async (sessionId) => {
    const response = await axiosClient.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Create new session
  createSession: async (sessionData) => {
    const response = await axiosClient.post('/sessions', sessionData);
    return response.data;
  },

  // Complete session
  completeSession: async (sessionId) => {
    const response = await axiosClient.put(`/sessions/${sessionId}/complete`);
    return response.data;
  },

  // Get footstep measurements for a session
  getFootsteps: async (sessionId) => {
    const response = await axiosClient.get(`/sessions/${sessionId}/footsteps`);
    return response.data;
  },
};
