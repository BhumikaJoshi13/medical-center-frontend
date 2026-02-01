import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Medication as MedicationIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import {
  fetchAppointmentsByPatient,
  fetchDoctors,
  createAppointment,
  cancelAppointment,
  selectAppointments,
  selectDoctors,
  selectAppointmentsLoading,
} from '../../redux/appointmentSlice';
import {
  fetchPrescriptions,
  selectPrescriptions,
} from '../../redux/pharmacySlice';
import { useAuth } from '../../hooks/useAuth';

/* -------------------- Stat Card -------------------- */
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="overline" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}.main`,
            borderRadius: 2,
            p: 1.5,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

/* -------------------- Dashboard -------------------- */
const PatientDashBoard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Redux state
  const appointments = useSelector(selectAppointments);
  const doctors = useSelector(selectDoctors);
  const prescriptions = useSelector(selectPrescriptions);
  const loading = useSelector(selectAppointmentsLoading);

  // SAFE ARRAYS
  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safeDoctors = Array.isArray(doctors) ? doctors : [];
  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];

  const [tabValue, setTabValue] = useState(0);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchAppointmentsByPatient(user.userId));
      dispatch(fetchPrescriptions());
    }
    dispatch(fetchDoctors());
  }, [dispatch, user?.userId]);

  /* -------------------- Helpers -------------------- */
  const getAppointmentStatusColor = (status = '') => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getUpcomingAppointments = () => {
    const today = new Date();
    return safeAppointments.filter(
      (apt) =>
        apt?.date &&
        new Date(apt.date) >= today &&
        apt?.status?.toLowerCase() === 'scheduled'
    );
  };

  /* -------------------- Actions -------------------- */
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      patientId: user?.userId,
      patientName: user?.username,
      status: 'scheduled',
    };

    await dispatch(createAppointment(payload));
    reset();
    setOpenBookingDialog(false);

    if (user?.userId) {
      dispatch(fetchAppointmentsByPatient(user.userId));
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!id) return;
    if (window.confirm('Cancel this appointment?')) {
      await dispatch(cancelAppointment(id));
      dispatch(fetchAppointmentsByPatient(user.userId));
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Welcome, {user?.username || 'Patient'}
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Upcoming Appointments"
            value={getUpcomingAppointments().length}
            icon={<CalendarIcon sx={{ color: '#fff' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Total Appointments"
            value={safeAppointments.length}
            icon={<AssignmentIcon sx={{ color: '#fff' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Prescriptions"
            value={safePrescriptions.length}
            icon={<MedicationIcon sx={{ color: '#fff' }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Action */}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setOpenBookingDialog(true)}
        sx={{ mb: 3 }}
      >
        Book New Appointment
      </Button>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="My Appointments" />
          <Tab label="Prescriptions" />
          <Tab label="Medical Records" />
        </Tabs>
      </Paper>

      {/* Appointments */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : safeAppointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                safeAppointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell>
                      {apt?.date
                        ? new Date(apt.date).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{apt?.time || 'N/A'}</TableCell>
                    <TableCell>{apt?.doctorName || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={apt?.status || 'Scheduled'}
                        color={getAppointmentStatusColor(apt?.status)}
                      />
                    </TableCell>
                    <TableCell>
                      {apt?.status === 'scheduled' && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Prescriptions */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          {safePrescriptions.length === 0 ? (
            <Typography align="center">No prescriptions found</Typography>
          ) : (
            safePrescriptions.map((p) => (
              <Typography key={p.id}>
                {p?.doctorName} – {p?.medicines?.join(', ') || 'N/A'}
              </Typography>
            ))
          )}
        </Paper>
      )}

      {/* Booking Dialog */}
      <Dialog open={openBookingDialog} onClose={() => setOpenBookingDialog(false)} fullWidth>
        <DialogTitle>Book Appointment</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField select fullWidth label="Doctor" margin="normal" {...register('doctorId', { required: true })}>
              {safeDoctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  Dr. {d.name || d.username}
                </MenuItem>
              ))}
            </TextField>

            <TextField fullWidth type="date" margin="normal" InputLabelProps={{ shrink: true }} {...register('date', { required: true })} />
            <TextField fullWidth type="time" margin="normal" InputLabelProps={{ shrink: true }} {...register('time', { required: true })} />
            <TextField fullWidth label="Reason" margin="normal" {...register('reason')} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenBookingDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Book</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PatientDashBoard;
