import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appointmentApi } from "../api/appointmentApi";
import toast from "react-hot-toast";

const initialState = {
  appointments: [],
  patients: [],
  doctors: [],          // ADDED — PatientDashboard needs this
  loading: false,
  error: null,
};

/* ===================== THUNKS ===================== */

// EXISTING — Doctor side
export const fetchAppointmentsByDoctor = createAsyncThunk(
  "appointments/fetchByDoctor",
  async (doctorId, { rejectWithValue }) => {
    try {
      return await appointmentApi.getAppointmentsByDoctor(doctorId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }
);

//  EXISTING
export const fetchPatients = createAsyncThunk(
  "appointments/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      return await appointmentApi.getPatients();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch patients"
      );
    }
  }
);

//  EXISTING
export const updateAppointmentStatus = createAsyncThunk(
  "appointments/updateStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      return await appointmentApi.updateStatus(id, status);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update appointment status"
      );
    }
  }
);

//  ADDED — PatientDashboard imports this
export const fetchAppointmentsByPatient = createAsyncThunk(
  "appointments/fetchByPatient",
  async (patientId, { rejectWithValue }) => {
    try {
      return await appointmentApi.getAppointmentsByPatient(patientId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch appointments"
      );
    }
  }
);

//  ADDED — PatientDashboard imports this
export const fetchDoctors = createAsyncThunk(
  "appointments/fetchDoctors",
  async (_, { rejectWithValue }) => {
    try {
      return await appointmentApi.getDoctors();
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch doctors"
      );
    }
  }
);

//  ADDED — PatientDashboard imports this
export const createAppointment = createAsyncThunk(
  "appointments/create",
  async (appointmentData, { rejectWithValue }) => {
    try {
      return await appointmentApi.createAppointment(appointmentData);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to create appointment"
      );
    }
  }
);

//  ADDED — PatientDashboard imports this
export const cancelAppointment = createAsyncThunk(
  "appointments/cancel",
  async (appointmentId, { rejectWithValue }) => {
    try {
      return await appointmentApi.cancelAppointment(appointmentId);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to cancel appointment"
      );
    }
  }
);

/* ===================== SLICE ===================== */

const appointmentSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    clearAppointmentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* -------- Fetch Appointments By Doctor -------- */
      .addCase(fetchAppointmentsByDoctor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByDoctor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      /* -------- Fetch Patients -------- */
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      /* -------- Update Appointment Status -------- */
      .addCase(updateAppointmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAppointment = action.payload;
        const index = state.appointments.findIndex(
          (a) => a.id === updatedAppointment.id
        );
        if (index !== -1) {
          state.appointments[index] = updatedAppointment;
        }
        toast.success("Appointment updated successfully");
      })
      .addCase(updateAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      /* --------  Fetch Appointments By Patient -------- */
      .addCase(fetchAppointmentsByPatient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAppointmentsByPatient.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointmentsByPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      /* --------  Fetch Doctors -------- */
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      /* --------  Create Appointment -------- */
      .addCase(createAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments.push(action.payload); // add new one to list
        toast.success("Appointment booked successfully");
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      })

      /* -------- Cancel Appointment -------- */
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        // action.meta.arg = the appointmentId passed to the thunk
        const index = state.appointments.findIndex(
          (a) => a.id === action.meta.arg
        );
        if (index !== -1) {
          state.appointments[index].status = "cancelled";
        }
        toast.success("Appointment cancelled successfully");
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

export const { clearAppointmentError } = appointmentSlice.actions;

export default appointmentSlice.reducer;

/* ===================== SELECTORS ===================== */

export const selectAppointments = (state) =>
  state.appointments.appointments;

export const selectPatients = (state) =>
  state.appointments.patients;

//  ADDED — PatientDashboard imports this
export const selectDoctors = (state) =>
  state.appointments.doctors;

export const selectAppointmentsLoading = (state) =>
  state.appointments.loading;

export const selectAppointmentsError = (state) =>
  state.appointments.error;