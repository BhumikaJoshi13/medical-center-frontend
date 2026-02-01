import axios from 'axios';

const PHARMACY_BASE_URL = ""

// Create axios instance for pharmacy service
const pharmacyAxios = axios.create({
  baseURL: PHARMACY_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add token
pharmacyAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
pharmacyAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const pharmacyApi = {
  // Get all medicines
  getAllMedicines: async () => {
    const response = await pharmacyAxios.get('/medicines');
    return response.data;
  },

  // Get medicine by ID
  getMedicineById: async (id) => {
    const response = await pharmacyAxios.get(`/medicines/${id}`);
    return response.data;
  },

  // Create new medicine
  createMedicine: async (medicineData) => {
    const response = await pharmacyAxios.post('/medicines', medicineData);
    return response.data;
  },

  // Update medicine
  updateMedicine: async (id, medicineData) => {
    const response = await pharmacyAxios.put(`/medicines/${id}`, medicineData);
    return response.data;
  },

  // Delete medicine
  deleteMedicine: async (id) => {
    const response = await pharmacyAxios.delete(`/medicines/${id}`);
    return response.data;
  },

  // Get all prescriptions
  getAllPrescriptions: async () => {
    const response = await pharmacyAxios.get('/prescriptions');
    return response.data;
  },

  // Get prescription by ID
  getPrescriptionById: async (id) => {
    const response = await pharmacyAxios.get(`/prescriptions/${id}`);
    return response.data;
  },

  // Create prescription
  createPrescription: async (prescriptionData) => {
    const response = await pharmacyAxios.post('/prescriptions', prescriptionData);
    return response.data;
  },

  // Update prescription status
  updatePrescriptionStatus: async (id, status) => {
    const response = await pharmacyAxios.patch(`/prescriptions/${id}/status`, { status });
    return response.data;
  },

  // Get inventory
  getInventory: async () => {
    const response = await pharmacyAxios.get('/inventory');
    return response.data;
  },

  // Update inventory
  updateInventory: async (medicineId, quantity) => {
    const response = await pharmacyAxios.patch(`/inventory/${medicineId}`, { quantity });
    return response.data;
  },
};

export default pharmacyAxios;