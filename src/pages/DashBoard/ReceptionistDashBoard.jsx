import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentApi } from "../../api/appointmentApi";
import toast from "react-hot-toast";

const initialState = {
  appointments: [],
  doctors: [],
  patients: [],
  loading: false,
  error: null,
};

/* ---------------- THUNKS ---------------- */

// Fetch all appointments
export const fetchAppointments = createAsyncThunk(
  "appointments/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await appointmentApi.getAllAppointments();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

// Fetch doctors
export const fetchDoctors = createAsyncThunk(
  "appointments/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      return await appointmentApi.getDoctors();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch doctors");
    }
  }
);

// Fetch patients
export const fetchPatients = createAsyncThunk(
  "appointments/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      return await appointmentApi.getPatients();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch patients");
    }
  }
);

// Create appointment
export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (data, { rejectWithValue }) => {
    try {
      return await appointmentApi.createAppointment(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create appointment");
    }
  }
);

// Update appointment status
export const updateAppointmentStatus = createAsyncThunk(
  "appointments/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await appointmentApi.updateStatus(id, status);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update status");
    }
  }
);

/* ---------------- SLICE ---------------- */

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch appointments
      .addCase(fetchAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      // fetch doctors
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.doctors = action.payload;
      })

      // fetch patients
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.patients = action.payload;
      })

      // create appointment
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.appointments.push(action.payload);
        toast.success("Appointment scheduled");
      })

      // update status
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        const idx = state.appointments.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.appointments[idx] = action.payload;
        toast.success("Appointment updated");
      });
  },
});

export default appointmentSlice.reducer;

/* ---------------- SELECTORS ---------------- */

export const selectAppointments = (state) => state.appointments.appointments;
export const selectDoctors = (state) => state.appointments.doctors;
export const selectPatients = (state) => state.appointments.patients;
export const selectAppointmentsLoading = (state) => state.appointments.loading;
