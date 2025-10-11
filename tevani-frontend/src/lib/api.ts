import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tevani_token');
    if (token) {
      // Set Authorization header
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log for debugging
      console.log(`Setting Authorization header for ${config.url}`);
    } else {
      console.warn(`No token found for request to ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('tevani_token');
      localStorage.removeItem('tevani_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string, type: 'business' | 'investor') => {
    // Create form data for OAuth2 compatibility
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/me', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Invoice API
export const invoiceAPI = {
  createInvoice: async (formData: FormData) => {
    // Get the token manually to ensure it's included
    const token = localStorage.getItem('tevani_token');
    
    if (!token) {
      console.error('No authentication token found. Please log in again.');
      // Redirect to login page
      window.location.href = '/auth/login';
      throw new Error('Authentication token not found');
    }
    
    try {
      console.log('Creating invoice with token:', token);
      
      // Use axios instead of fetch for better error handling
      const response = await api.post('/invoices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 60000, // 60 seconds timeout for file uploads
        maxBodyLength: 10 * 1024 * 1024, // 10MB max body length
        maxContentLength: 10 * 1024 * 1024, // 10MB max content length
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in createInvoice:', error);
      throw error;
    }
  },
  
  processInvoiceFile: async (file: File) => {
    const formData = new FormData();
    formData.append('invoice_file', file);
    
    // Get the token manually to ensure it's included
    const token = localStorage.getItem('tevani_token');
    
    if (!token) {
      console.error('No authentication token found. Please log in again.');
      // Redirect to login page
      window.location.href = '/auth/login';
      throw new Error('Authentication token not found');
    }
    
    try {
      console.log('Processing invoice file with token:', token);
      
      // Use axios instead of fetch for better error handling
      const response = await api.post('/invoices/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        timeout: 60000, // 60 seconds timeout for file uploads
        maxBodyLength: 10 * 1024 * 1024, // 10MB max body length
        maxContentLength: 10 * 1024 * 1024, // 10MB max content length
      });
      
      return response.data;
    } catch (error) {
      console.error('Error in processInvoiceFile:', error);
      throw error;
    }
  },
  
  getInvoices: async (params?: any) => {
    const response = await api.get('/invoices', { params });
    return response.data;
  },
  
  getInvoice: async (id: string) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
  
  updateInvoice: async (id: string, data: any) => {
    const response = await api.put(`/invoices/${id}`, data);
    return response.data;
  },
  
  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
};

// Validation API
export const validationAPI = {
  validateInvoice: async (id: string) => {
    const response = await api.post(`/validation/${id}`);
    return response.data;
  },
};

// LegalBot API
export const legalbotAPI = {
  createConsent: async (data: any) => {
    const response = await api.post('/legalbot/consent', data);
    return response.data;
  },
  
  getConsent: async (id: string) => {
    const response = await api.get(`/legalbot/consent/${id}`);
    return response.data;
  },
  
  getConsentByInvoice: async (invoiceId: string) => {
    const response = await api.get(`/legalbot/consent/invoice/${invoiceId}`);
    return response.data;
  },
  
  updateConsent: async (id: string, data: any) => {
    const response = await api.put(`/legalbot/consent/${id}`, data);
    return response.data;
  },
  
  sendNotification: async (data: any, consentId?: string) => {
    const params = consentId ? { consent_id: consentId } : undefined;
    const response = await api.post('/legalbot/notification', data, { params });
    return response.data;
  },
  
  updateNotification: async (id: string, data: any) => {
    const response = await api.put(`/legalbot/notification/${id}`, data);
    return response.data;
  },
  
  logConsentEvent: async (consentId: string, event: string, details?: any) => {
    const response = await api.post(`/legalbot/consent/log/${consentId}`, {
      event,
      details,
    });
    return response.data;
  },
  
  checkPassiveConsent: async () => {
    const response = await api.post('/legalbot/consent/check-passive');
    return response.data;
  },
};

// Mock data for local development
export const mockData = {
  createMockInvoice: (data: any) => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const newInvoice = {
      id: Date.now().toString(),
      invoice_number: data.invoice_number || `INV-${Math.floor(Math.random() * 10000)}`,
      amount: parseFloat(data.amount) || 10000,
      invoice_date: data.invoice_date || new Date().toISOString(),
      due_date: data.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: data.description || 'Mock invoice for testing',
      buyer_name: data.buyer_name || 'Mock Buyer Ltd.',
      status: 'pending_validation',
      trust_score: Math.floor(Math.random() * 40) + 60, // 60-99
      risk_tier: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      funded_amount: 0,
      available_amount: parseFloat(data.amount) || 10000,
      created_at: new Date().toISOString(),
      ownerId: data.seller_id || JSON.parse(localStorage.getItem('tevani_user') || '{}').id || 'mock-user',
    };
    
    invoices.push(newInvoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));
    return newInvoice;
  },
  
  validateMockInvoice: (id: string) => {
    const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    const index = invoices.findIndex((inv: any) => inv.id === id);
    
    if (index !== -1) {
      invoices[index].status = 'validated';
      localStorage.setItem('invoices', JSON.stringify(invoices));
      return invoices[index];
    }
    
    return null;
  },
};

export default api;

// Made with Bob
