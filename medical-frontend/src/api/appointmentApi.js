import axios from 'axios';

const APPOINTMENT_BASE_URL = ""

// Create axios instance for appointment service
const appointmentAxios = axios.create({
  baseURL: APPOINTMENT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add token
appointmentAxios.interceptors.request.use(
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
appointmentAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const appointmentApi = {
  // Get all appointments
  getAllAppointments: async () => {
    const response = await appointmentAxios.get('/appointments');
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id) => {
    const response = await appointmentAxios.get(`/appointments/${id}`);
    return response.data;
  },

  // Get appointments by doctor
  getAppointmentsByDoctor: async (doctorId) => {
    const response = await appointmentAxios.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  },

  // Get appointments by patient
  getAppointmentsByPatient: async (patientId) => {
    const response = await appointmentAxios.get(`/appointments/patient/${patientId}`);
    return response.data;
  },

  // Create new appointment
  createAppointment: async (appointmentData) => {
    const response = await appointmentAxios.post('/appointments', appointmentData);
    return response.data;
  },

  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    const response = await appointmentAxios.put(`/appointments/${id}`, appointmentData);
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (id) => {
    const response = await appointmentAxios.patch(`/appointments/${id}/cancel`);
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (id, status) => {
    const response = await appointmentAxios.patch(`/appointments/${id}/status`, { status });
    return response.data;
  },

  // Get available slots for a doctor
  getAvailableSlots: async (doctorId, date) => {
    const response = await appointmentAxios.get(`/appointments/available-slots`, {
      params: { doctorId, date }
    });
    return response.data;
  },

  // Get all doctors
  getAllDoctors: async () => {
    const response = await appointmentAxios.get('/doctors');
    return response.data;
  },

  // Get doctor by ID
  getDoctorById: async (id) => {
    const response = await appointmentAxios.get(`/doctors/${id}`);
    return response.data;
  },

  // Get all patients
  getAllPatients: async () => {
    const response = await appointmentAxios.get('/patients');
    return response.data;
  },

  // Get patient by ID
  getPatientById: async (id) => {
    const response = await appointmentAxios.get(`/patients/${id}`);
    return response.data;
  },
};

export default appointmentAxios;