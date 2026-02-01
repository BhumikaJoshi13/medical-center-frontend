import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import pharmacyReducer from './pharmacySlice';
import appointmentReducer from './appointmentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    pharmacy: pharmacyReducer,
    appointments: appointmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;