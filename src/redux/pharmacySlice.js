import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pharmacyApi } from "../api/pharmacyApi";
import toast from 'react-hot-toast';

const initialState = {
  medicines: [],
  selectedMedicine: null,
  prescriptions: [],
  selectedPrescription: null,
  inventory: [],
  loading: false,
  error: null,
};

// Async thunks for medicines
export const fetchMedicines = createAsyncThunk(
  'pharmacy/fetchMedicines',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getAllMedicines();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medicines');
    }
  }
);

export const fetchMedicineById = createAsyncThunk(
  'pharmacy/fetchMedicineById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getMedicineById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch medicine');
    }
  }
);

export const createMedicine = createAsyncThunk(
  'pharmacy/createMedicine',
  async (medicineData, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.createMedicine(medicineData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create medicine');
    }
  }
);

export const updateMedicine = createAsyncThunk(
  'pharmacy/updateMedicine',
  async ({ id, medicineData }, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.updateMedicine(id, medicineData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update medicine');
    }
  }
);

export const deleteMedicine = createAsyncThunk(
  'pharmacy/deleteMedicine',
  async (id, { rejectWithValue }) => {
    try {
      await pharmacyApi.deleteMedicine(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete medicine');
    }
  }
);

// Async thunks for prescriptions
export const fetchPrescriptions = createAsyncThunk(
  'pharmacy/fetchPrescriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getAllPrescriptions();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescriptions');
    }
  }
);

export const fetchPrescriptionById = createAsyncThunk(
  'pharmacy/fetchPrescriptionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getPrescriptionById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prescription');
    }
  }
);

export const createPrescription = createAsyncThunk(
  'pharmacy/createPrescription',
  async (prescriptionData, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.createPrescription(prescriptionData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create prescription');
    }
  }
);

export const updatePrescriptionStatus = createAsyncThunk(
  'pharmacy/updatePrescriptionStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.updatePrescriptionStatus(id, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update prescription');
    }
  }
);

// Async thunks for inventory
export const fetchInventory = createAsyncThunk(
  'pharmacy/fetchInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await pharmacyApi.getInventory();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch inventory');
    }
  }
);

// Pharmacy slice
const pharmacySlice = createSlice({
  name: 'pharmacy',
  initialState,
  reducers: {
    clearSelectedMedicine: (state) => {
      state.selectedMedicine = null;
    },
    clearSelectedPrescription: (state) => {
      state.selectedPrescription = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch medicines
    builder
      .addCase(fetchMedicines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicines.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = action.payload;
      })
      .addCase(fetchMedicines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Fetch medicine by ID
    builder
      .addCase(fetchMedicineById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMedicineById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMedicine = action.payload;
      })
      .addCase(fetchMedicineById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Create medicine
    builder
      .addCase(createMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines.push(action.payload);
        toast.success('Medicine created successfully');
      })
      .addCase(createMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Update medicine
    builder
      .addCase(updateMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateMedicine.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.medicines.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.medicines[index] = action.payload;
        }
        toast.success('Medicine updated successfully');
      })
      .addCase(updateMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Delete medicine
    builder
      .addCase(deleteMedicine.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteMedicine.fulfilled, (state, action) => {
        state.loading = false;
        state.medicines = state.medicines.filter((m) => m.id !== action.payload);
        toast.success('Medicine deleted successfully');
      })
      .addCase(deleteMedicine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Fetch prescriptions
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Fetch prescription by ID
    builder
      .addCase(fetchPrescriptionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPrescriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPrescription = action.payload;
      })
      .addCase(fetchPrescriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Create prescription
    builder
      .addCase(createPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions.push(action.payload);
        toast.success('Prescription created successfully');
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });

    // Fetch inventory
    builder
      .addCase(fetchInventory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.inventory = action.payload;
      })
      .addCase(fetchInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload);
      });
  },
});

// Export actions
export const { clearSelectedMedicine, clearSelectedPrescription, clearError } = pharmacySlice.actions;

// Export selectors
export const selectMedicines = (state) => state.pharmacy.medicines;
export const selectSelectedMedicine = (state) => state.pharmacy.selectedMedicine;
export const selectPrescriptions = (state) => state.pharmacy.prescriptions;
export const selectSelectedPrescription = (state) => state.pharmacy.selectedPrescription;
export const selectInventory = (state) => state.pharmacy.inventory;
export const selectPharmacyLoading = (state) => state.pharmacy.loading;
export const selectPharmacyError = (state) => state.pharmacy.error;

// Export reducer
export default pharmacySlice.reducer;