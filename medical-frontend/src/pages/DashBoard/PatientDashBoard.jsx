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
} from '../../redux/slices/appointmentSlice';
import {
  fetchPrescriptions,
  selectPrescriptions,
} from '../../redux/slices/pharmacySlice';
import { useAuth } from '../../hooks/useAuth';

const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" variant="overline">
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

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const appointments = useSelector(selectAppointments);
  const doctors = useSelector(selectDoctors);
  const prescriptions = useSelector(selectPrescriptions);
  const loading = useSelector(selectAppointmentsLoading);

  const [tabValue, setTabValue] = useState(0);
  const [openBookingDialog, setOpenBookingDialog] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchAppointmentsByPatient(user.userId));
      dispatch(fetchPrescriptions());
    }
    dispatch(fetchDoctors());
  }, [dispatch, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenBooking = () => {
    setOpenBookingDialog(true);
  };

  const handleCloseBooking = () => {
    setOpenBookingDialog(false);
    reset();
  };

  const onSubmit = async (data) => {
    const appointmentData = {
      ...data,
      patientId: user?.userId,
      patientName: user?.username,
      status: 'scheduled',
    };
    await dispatch(createAppointment(appointmentData));
    handleCloseBooking();
    if (user?.userId) {
      dispatch(fetchAppointmentsByPatient(user.userId));
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      await dispatch(cancelAppointment(appointmentId));
      if (user?.userId) {
        dispatch(fetchAppointmentsByPatient(user.userId));
      }
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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
    return appointments.filter(
      (apt) =>
        new Date(apt.date) >= today &&
        apt.status?.toLowerCase() === 'scheduled'
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Patient Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Welcome, {user?.username}! Manage your appointments and health records.
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Upcoming Appointments"
            value={getUpcomingAppointments().length}
            icon={<CalendarIcon sx={{ color: 'white' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon={<AssignmentIcon sx={{ color: 'white' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Prescriptions"
            value={prescriptions.length}
            icon={<MedicationIcon sx={{ color: 'white' }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Quick Action */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleOpenBooking}
        >
          Book New Appointment
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="My Appointments" />
          <Tab label="Prescriptions" />
          <Tab label="Medical Records" />
        </Tabs>
      </Paper>

      {/* Appointments Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Appointments
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : appointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No appointments found. Book your first appointment!
                    </TableCell>
                  </TableRow>
                ) : (
                  appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        {appointment.date
                          ? new Date(appointment.date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{appointment.time || 'N/A'}</TableCell>
                      <TableCell>{appointment.doctorName || 'N/A'}</TableCell>
                      <TableCell>{appointment.reason || 'General checkup'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status || 'Scheduled'}
                          color={getAppointmentStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {appointment.status?.toLowerCase() === 'scheduled' && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleCancelAppointment(appointment.id)}
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
          </TableContainer>
        </Paper>
      )}

      {/* Prescriptions Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Prescriptions
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Medicines</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>
                        {prescription.date
                          ? new Date(prescription.date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{prescription.doctorName || 'N/A'}</TableCell>
                      <TableCell>
                        {prescription.medicines?.join(', ') || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={prescription.status || 'Pending'}
                          color={
                            prescription.status === 'dispensed'
                              ? 'success'
                              : 'warning'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Medical Records Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Medical Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your medical records and history will appear here.
          </Typography>
        </Paper>
      )}

      {/* Book Appointment Dialog */}
      <Dialog
        open={openBookingDialog}
        onClose={handleCloseBooking}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Book New Appointment</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Select Doctor"
              margin="normal"
              {...register('doctorId', { required: true })}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name || doctor.username}
                  {doctor.specialization && ` - ${doctor.specialization}`}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="date"
              label="Appointment Date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register('date', { required: true })}
            />

            <TextField
              fullWidth
              type="time"
              label="Preferred Time"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...register('time', { required: true })}
            />

            <TextField
              fullWidth
              label="Reason for Visit"
              margin="normal"
              multiline
              rows={3}
              {...register('reason', { required: true })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseBooking}>Cancel</Button>
            <Button type="submit" variant="contained">
              Book Appointment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PatientDashboard;