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
 login: async (email: string, password: string, type: 'business' | 'investor' | 'admin') => {
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
  // Starred invoices
 getStarredInvoices: async () => {
   const response = await api.get('/invoices/starred');
   return response.data;
 },
  starInvoice: async (id: string) => {
   const response = await api.post(`/invoices/${id}/star`);
   return response.data;
 },
  unstarInvoice: async (id: string) => {
   const response = await api.delete(`/invoices/${id}/star`);
   return response.data;
 },
};


// Return Rate API
export const returnRateAPI = {
 getReturnRates: async () => {
   try {
     // Try to get from system settings first (for admin users)
     const response = await api.get('/admin/settings');
     if (response.data && response.data.riskTier) {
       // Calculate return rates based on multipliers
       const baseRate = 12.0; // Base rate
       return {
         A: baseRate * response.data.trrf.tierAMultiplier,
         B: baseRate * response.data.trrf.tierBMultiplier,
         C: baseRate * response.data.trrf.tierCMultiplier,
         D: baseRate * response.data.trrf.tierDMultiplier,
       };
     }
   } catch (error) {
     console.warn('Could not fetch return rates from admin settings, using defaults');
   }
  
   // Fallback to default values
   return {
     A: 12.0,
     B: 14.0,
     C: 15.5,
     D: 17.0
   };
 }
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


// Admin API
export const adminAPI = {
 // Dashboard
 getDashboardStats: async () => {
   const response = await api.get('/admin/dashboard/stats');
   return response.data;
 },
  // User Management
 getUsers: async (params?: any) => {
   const response = await api.get('/admin/users', { params });
   return response.data;
 },
  getUserById: async (id: string) => {
   const response = await api.get(`/admin/users/${id}`);
   return response.data;
 },
  updateUser: async (id: string, data: any) => {
   const response = await api.put(`/admin/users/${id}`, data);
   return response.data;
 },
  activateUser: async (id: string) => {
   const response = await api.post(`/admin/users/${id}/activate`);
   return response.data;
 },
  deactivateUser: async (id: string) => {
   const response = await api.post(`/admin/users/${id}/deactivate`);
   return response.data;
 },
  updateKycStatus: async (userId: string, status: string, notes?: string) => {
   const response = await api.post(`/admin/users/${userId}/kyc`, { status, notes });
   return response.data;
 },
  // Invoice Management
 getAllInvoices: async (params?: any) => {
   const response = await api.get('/admin/invoices', { params });
   return response.data;
 },
  getInvoiceById: async (id: string) => {
   const response = await api.get(`/admin/invoices/${id}`);
   return response.data;
 },
  updateInvoiceStatus: async (id: string, status: string, notes?: string) => {
   const response = await api.put(`/admin/invoices/${id}/status`, { status, notes });
   return response.data;
 },
  // Validation
 getPendingValidations: async () => {
   const response = await api.get('/admin/validation/pending');
   return response.data;
 },
  validateInvoice: async (id: string, validationData: any) => {
   const response = await api.post(`/admin/validation/${id}`, validationData);
   return response.data;
 },
  rejectInvoice: async (id: string, reason: string) => {
   const response = await api.post(`/admin/validation/${id}/reject`, { reason });
   return response.data;
 },
  // Investment Management
 getAllInvestments: async (params?: any) => {
   const response = await api.get('/admin/investments', { params });
   return response.data;
 },
  getInvestmentById: async (id: string) => {
   const response = await api.get(`/admin/investments/${id}`);
   return response.data;
 },
  // TRRF Fund Management
 getTRRFStats: async () => {
   const response = await api.get('/admin/trrf/stats');
   return response.data;
 },
  getTRRFDisbursals: async (params?: any) => {
   const response = await api.get('/admin/trrf/disbursals', { params });
   return response.data;
 },
  approveTRRFDisbursal: async (id: string) => {
   const response = await api.post(`/admin/trrf/disbursals/${id}/approve`);
   return response.data;
 },
  rejectTRRFDisbursal: async (id: string, reason: string) => {
   const response = await api.post(`/admin/trrf/disbursals/${id}/reject`, { reason });
   return response.data;
 },
  // Compliance
 getConsents: async (params?: any) => {
   const response = await api.get('/admin/compliance/consents', { params });
   return response.data;
 },
  getConsentById: async (id: string) => {
   const response = await api.get(`/admin/compliance/consents/${id}`);
   return response.data;
 },
  sendConsentReminder: async (id: string) => {
   const response = await api.post(`/admin/compliance/consents/${id}/remind`);
   return response.data;
 },
  getAuditLogs: async (params?: any) => {
   const response = await api.get('/admin/compliance/audit-logs', { params });
   return response.data;
 },
  getComplianceFlags: async (params?: any) => {
   const response = await api.get('/admin/compliance/flags', { params });
   return response.data;
 },
  getComplianceFlagById: async (id: string) => {
   const response = await api.get(`/admin/compliance/flags/${id}`);
   return response.data;
 },
  updateComplianceFlag: async (id: string, data: any) => {
   const response = await api.put(`/admin/compliance/flags/${id}`, data);
   return response.data;
 },
  // System Settings
 getSystemSettings: async () => {
   const response = await api.get('/admin/settings');
   return response.data;
 },
  updateSystemSettings: async (category: string, settings: any) => {
   const response = await api.put(`/admin/settings/${category}`, settings);
   return response.data;
 }
};


export default api;


 





