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
  PersonAdd as PersonAddIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  AssignmentTurnedIn as CheckInIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import {
  fetchAppointments,
  fetchDoctors,
  fetchPatients,
  createAppointment,
  updateAppointmentStatus,
  selectAppointments,
  selectDoctors,
  selectPatients,
  selectAppointmentsLoading,
} from '../../redux/slices/appointmentSlice';

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

const ReceptionistDashboard = () => {
  const dispatch = useDispatch();
  const appointments = useSelector(selectAppointments);
  const doctors = useSelector(selectDoctors);
  const patients = useSelector(selectPatients);
  const loading = useSelector(selectAppointmentsLoading);

  const [tabValue, setTabValue] = useState(0);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openPatientDialog, setOpenPatientDialog] = useState(false);

  const { register: registerAppt, handleSubmit: handleSubmitAppt, reset: resetAppt } = useForm();
  const { register: registerPatient, handleSubmit: handleSubmitPatient, reset: resetPatient } = useForm();

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchDoctors());
    dispatch(fetchPatients());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenAppointmentDialog = () => {
    setOpenAppointmentDialog(true);
  };

  const handleCloseAppointmentDialog = () => {
    setOpenAppointmentDialog(false);
    resetAppt();
  };

  const handleOpenPatientDialog = () => {
    setOpenPatientDialog(true);
  };

  const handleClosePatientDialog = () => {
    setOpenPatientDialog(false);
    resetPatient();
  };

  const onSubmitAppointment = async (data) => {
    const appointmentData = {
      ...data,
      status: 'scheduled',
    };
    await dispatch(createAppointment(appointmentData));
    handleCloseAppointmentDialog();
    dispatch(fetchAppointments());
  };

  const onSubmitPatient = async (data) => {
    // In a real app, this would call a patient registration API
    console.log('New patient:', data);
    handleClosePatientDialog();
    dispatch(fetchPatients());
  };

  const handleCheckIn = async (appointmentId) => {
    await dispatch(updateAppointmentStatus({ id: appointmentId, status: 'in-progress' }));
    dispatch(fetchAppointments());
  };

  const getAppointmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'info';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTodayAppointments = () => {
    const today = new Date().toDateString();
    return appointments.filter(
      (apt) => new Date(apt.date).toDateString() === today
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Receptionist Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage patient check-ins and appointments
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Appointments"
            value={getTodayAppointments().length}
            icon={<CalendarIcon sx={{ color: 'white' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Checked In"
            value={
              getTodayAppointments().filter((a) => a.status === 'in-progress')
                .length
            }
            icon={<CheckInIcon sx={{ color: 'white' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={patients.length}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed"
            value={
              getTodayAppointments().filter((a) => a.status === 'completed')
                .length
            }
            icon={<CheckInIcon sx={{ color: 'white' }} />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<CalendarIcon />}
          onClick={handleOpenAppointmentDialog}
        >
          Schedule Appointment
        </Button>
        <Button
          variant="outlined"
          startIcon={<PersonAddIcon />}
          onClick={handleOpenPatientDialog}
        >
          Register New Patient
        </Button>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Today's Appointments" />
          <Tab label="All Appointments" />
          <Tab label="Patients" />
        </Tabs>
      </Paper>

      {/* Today's Appointments Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Today's Schedule
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Patient Name</TableCell>
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
                ) : getTodayAppointments().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No appointments scheduled for today.
                    </TableCell>
                  </TableRow>
                ) : (
                  getTodayAppointments().map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>{appointment.time || 'N/A'}</TableCell>
                      <TableCell>{appointment.patientName || 'N/A'}</TableCell>
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
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleCheckIn(appointment.id)}
                          >
                            Check In
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

      {/* All Appointments Tab */}
      {tabValue === 1 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            All Appointments
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Doctor</TableCell>
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
                      No appointments found.
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
                      <TableCell>{appointment.patientName || 'N/A'}</TableCell>
                      <TableCell>{appointment.doctorName || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status || 'Scheduled'}
                          color={getAppointmentStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View
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

      {/* Patients Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registered Patients
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Contact</TableCell>
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
                ) : patients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No patients registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  patients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>#{patient.id}</TableCell>
                      <TableCell>{patient.name || 'N/A'}</TableCell>
                      <TableCell>{patient.age || 'N/A'}</TableCell>
                      <TableCell>{patient.gender || 'N/A'}</TableCell>
                      <TableCell>{patient.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View Profile
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

      {/* Schedule Appointment Dialog */}
      <Dialog
        open={openAppointmentDialog}
        onClose={handleCloseAppointmentDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Schedule New Appointment</DialogTitle>
        <form onSubmit={handleSubmitAppt(onSubmitAppointment)}>
          <DialogContent>
            <TextField
              select
              fullWidth
              label="Select Patient"
              margin="normal"
              {...registerAppt('patientId', { required: true })}
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.name || patient.username}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label="Select Doctor"
              margin="normal"
              {...registerAppt('doctorId', { required: true })}
            >
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name || doctor.username}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              type="date"
              label="Appointment Date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...registerAppt('date', { required: true })}
            />

            <TextField
              fullWidth
              type="time"
              label="Time"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...registerAppt('time', { required: true })}
            />

            <TextField
              fullWidth
              label="Reason"
              margin="normal"
              multiline
              rows={2}
              {...registerAppt('reason')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAppointmentDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Schedule
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Register Patient Dialog */}
      <Dialog
        open={openPatientDialog}
        onClose={handleClosePatientDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Register New Patient</DialogTitle>
        <form onSubmit={handleSubmitPatient(onSubmitPatient)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              {...registerPatient('name', { required: true })}
            />
            <TextField
              fullWidth
              type="number"
              label="Age"
              margin="normal"
              {...registerPatient('age', { required: true })}
            />
            <TextField
              select
              fullWidth
              label="Gender"
              margin="normal"
              defaultValue=""
              {...registerPatient('gender', { required: true })}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Phone"
              margin="normal"
              {...registerPatient('phone', { required: true })}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...registerPatient('email')}
            />
            <TextField
              fullWidth
              label="Address"
              margin="normal"
              multiline
              rows={2}
              {...registerPatient('address')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePatientDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              Register
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ReceptionistDashboard;