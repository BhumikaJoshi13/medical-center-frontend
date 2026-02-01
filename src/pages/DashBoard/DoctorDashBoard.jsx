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
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

import {
  fetchAppointmentsByDoctor,
  fetchPatients,
  updateAppointmentStatus,
  selectAppointments,
  selectPatients,
  selectAppointmentsLoading,
} from '../../redux/appointmentSlice';
import { useAuth } from '../../hooks/useAuth';

/**
 * Reusable card for dashboard statistics
 */
const StatCard = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography color="text.secondary" variant="overline">
            {title}
          </Typography>
          <Typography variant="h4">{value ?? 0}</Typography>
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

/**
 * Doctor Dashboard Component
 */
const DoctorDashBoard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Redux state
  const appointments = useSelector(selectAppointments);
  const patients = useSelector(selectPatients);
  const loading = useSelector(selectAppointmentsLoading);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  // Fetch appointments and patients on component mount
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchAppointmentsByDoctor(user.userId));
      dispatch(fetchPatients());
    }
  }, [dispatch, user]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment ?? null);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setOpenDetailsDialog(false);
    setSelectedAppointment(null);
  };

  /**
   * Optimistic status update — updates local state without refetching all appointments
   */
  const handleStatusUpdate = (appointmentId, status) => {
    if (!appointmentId || !status) return;

    // Update Redux state
    dispatch(updateAppointmentStatus({ id: appointmentId, status }));

    // Update selectedAppointment if it's currently open
    if (selectedAppointment?.id === appointmentId) {
      setSelectedAppointment({
        ...selectedAppointment,
        status,
      });
    }
  };

  /**
   * Map appointment status to MUI Chip color
   */
  const getAppointmentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'info';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'in-progress':
        return 'warning';
      default:
        return 'default';
    }
  };

  /**
   * Filter today's appointments safely
   */
  const getTodayAppointments = () => {
    if (!Array.isArray(appointments)) return [];
    const today = new Date().toDateString();
    return appointments.filter(
      (apt) => apt?.date && new Date(apt.date).toDateString() === today
    );
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const safePatients = Array.isArray(patients) ? patients : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Welcome, Dr. {user?.username ?? 'Doctor'}! Manage your appointments and patients.
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
            title="Total Appointments"
            value={safeAppointments.length}
            icon={<AssignmentIcon sx={{ color: 'white' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={safePatients.length}
            icon={<PeopleIcon sx={{ color: 'white' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Today"
            value={getTodayAppointments().filter((a) => a?.status === 'completed').length}
            icon={<CheckCircleIcon sx={{ color: 'white' }} />}
            color="warning"
          />
        </Grid>
      </Grid>

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
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : getTodayAppointments().length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No appointments scheduled for today.
                    </TableCell>
                  </TableRow>
                ) : (
                  getTodayAppointments().map((appointment, index) => (
                    <TableRow key={appointment?.id ?? index}>
                      <TableCell>{appointment?.time ?? 'N/A'}</TableCell>
                      <TableCell>{appointment?.patientName ?? 'N/A'}</TableCell>
                      <TableCell>{appointment?.reason ?? 'General checkup'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment?.status ?? 'Scheduled'}
                          color={getAppointmentStatusColor(appointment?.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(appointment)}
                          sx={{ mr: 1 }}
                        >
                          Details
                        </Button>
                        {appointment?.status !== 'completed' && (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() =>
                              handleStatusUpdate(appointment?.id, 'completed')
                            }
                          >
                            Complete
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
                  <TableCell>Patient Name</TableCell>
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
                ) : safeAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No appointments found.
                    </TableCell>
                  </TableRow>
                ) : (
                  safeAppointments.map((appointment, index) => (
                    <TableRow key={appointment?.id ?? index}>
                      <TableCell>
                        {appointment?.date
                          ? new Date(appointment.date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>{appointment?.time ?? 'N/A'}</TableCell>
                      <TableCell>{appointment?.patientName ?? 'N/A'}</TableCell>
                      <TableCell>{appointment?.reason ?? 'General checkup'}</TableCell>
                      <TableCell>
                        <Chip
                          label={appointment?.status ?? 'Scheduled'}
                          color={getAppointmentStatusColor(appointment?.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewDetails(appointment)}
                        >
                          Details
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
            My Patients
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
                  <TableCell>Last Visit</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : safePatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No patients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  safePatients.map((patient, index) => (
                    <TableRow key={patient?.id ?? index}>
                      <TableCell>#{patient?.id ?? 'N/A'}</TableCell>
                      <TableCell>{patient?.name ?? 'N/A'}</TableCell>
                      <TableCell>{patient?.age ?? 'N/A'}</TableCell>
                      <TableCell>{patient?.gender ?? 'N/A'}</TableCell>
                      <TableCell>{patient?.phone ?? 'N/A'}</TableCell>
                      <TableCell>
                        {patient?.lastVisit
                          ? new Date(patient.lastVisit).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          View Records
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

      {/* Appointment Details Dialog */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Appointment Details</DialogTitle>
        <DialogContent>
          {selectedAppointment ? (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1">
                <strong>Patient:</strong> {selectedAppointment?.patientName ?? 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Date:</strong>{' '}
                {selectedAppointment?.date
                  ? new Date(selectedAppointment.date).toLocaleDateString()
                  : 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Time:</strong> {selectedAppointment?.time ?? 'N/A'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Reason:</strong> {selectedAppointment?.reason ?? 'General checkup'}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedAppointment?.status ?? 'Scheduled'}
                  color={getAppointmentStatusColor(selectedAppointment?.status)}
                  size="small"
                />
              </Typography>
            </Box>
          ) : (
            <Typography>No appointment selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleCloseDetails();
              alert('Prescription feature coming soon!');
            }}
          >
            Write Prescription
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoctorDashBoard;
