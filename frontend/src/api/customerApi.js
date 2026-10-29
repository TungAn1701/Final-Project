import axiosClient from './axiosClient';

export const customerApi = {
  // Get all customers with optional search filter (Name, Phone, Email)
  getCustomers: async (search = '') => {
    const params = search ? { search } : {};
    const response = await axiosClient.get('/customers', { params });
    return response.data;
  },

  // Get specific customer details by ID
  getCustomerById: async (id) => {
    const response = await axiosClient.get(`/customers/${id}`);
    return response.data;
  },

  // Create new customer profile
  createCustomer: async (customerData) => {
    const response = await axiosClient.post('/customers', customerData);
    return response.data;
  },

  // Update customer profile
  updateCustomer: async (id, customerData) => {
    const response = await axiosClient.put(`/customers/${id}`, customerData);
    return response.data;
  },

  // Delete customer profile
  deleteCustomer: async (id) => {
    const response = await axiosClient.delete(`/customers/${id}`);
    return response.data;
  },
};
