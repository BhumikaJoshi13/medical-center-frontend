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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Medication as MedicationIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import {
  fetchMedicines,
  fetchPrescriptions,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  selectMedicines,
  selectPrescriptions,
  selectPharmacyLoading,
} from '../../redux/slices/pharmacySlice';

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

const PharmacistDashboard = () => {
  const dispatch = useDispatch();
  const medicines = useSelector(selectMedicines);
  const prescriptions = useSelector(selectPrescriptions);
  const loading = useSelector(selectPharmacyLoading);

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    dispatch(fetchMedicines());
    dispatch(fetchPrescriptions());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (medicine = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setValue('name', medicine.name);
      setValue('description', medicine.description);
      setValue('price', medicine.price);
      setValue('quantity', medicine.quantity);
      setValue('manufacturer', medicine.manufacturer);
    } else {
      setEditingMedicine(null);
      reset();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingMedicine(null);
    reset();
  };

  const onSubmit = async (data) => {
    if (editingMedicine) {
      await dispatch(updateMedicine({ id: editingMedicine.id, medicineData: data }));
    } else {
      await dispatch(createMedicine(data));
    }
    handleCloseDialog();
    dispatch(fetchMedicines());
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      await dispatch(deleteMedicine(id));
      dispatch(fetchMedicines());
    }
  };

  const getPrescriptionStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'dispensed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pharmacist Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage medicines, prescriptions, and inventory
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Medicines"
            value={medicines.length}
            icon={<MedicationIcon sx={{ color: 'white' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Prescriptions"
            value={prescriptions.length}
            icon={<AssignmentIcon sx={{ color: 'white' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={medicines.filter((m) => m.quantity < 10).length}
            icon={<InventoryIcon sx={{ color: 'white' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`₹${medicines.reduce((sum, m) => sum + m.price * m.quantity, 0).toFixed(2)}`}
            icon={<TrendingUpIcon sx={{ color: 'white' }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Medicines" />
          <Tab label="Prescriptions" />
        </Tabs>
      </Paper>

      {/* Medicines Tab */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Medicine Inventory</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Medicine
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Manufacturer</TableCell>
                  <TableCell>Status</TableCell>
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
                ) : medicines.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No medicines found. Add your first medicine!
                    </TableCell>
                  </TableRow>
                ) : (
                  medicines.map((medicine) => (
                    <TableRow key={medicine.id}>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>{medicine.description}</TableCell>
                      <TableCell>₹{medicine.price}</TableCell>
                      <TableCell>{medicine.quantity}</TableCell>
                      <TableCell>{medicine.manufacturer}</TableCell>
                      <TableCell>
                        <Chip
                          label={medicine.quantity < 10 ? 'Low Stock' : 'In Stock'}
                          color={medicine.quantity < 10 ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(medicine)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(medicine.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
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
            Prescriptions to Dispense
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Prescription ID</TableCell>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Doctor Name</TableCell>
                  <TableCell>Medicines</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
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
                ) : prescriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No prescriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  prescriptions.map((prescription) => (
                    <TableRow key={prescription.id}>
                      <TableCell>#{prescription.id}</TableCell>
                      <TableCell>{prescription.patientName || 'N/A'}</TableCell>
                      <TableCell>{prescription.doctorName || 'N/A'}</TableCell>
                      <TableCell>{prescription.medicines?.join(', ') || 'N/A'}</TableCell>
                      <TableCell>
                        {prescription.date
                          ? new Date(prescription.date).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={prescription.status || 'Pending'}
                          color={getPrescriptionStatusColor(prescription.status)}
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

      {/* Add/Edit Medicine Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              fullWidth
              label="Medicine Name"
              margin="normal"
              {...register('name', { required: true })}
            />
            <TextField
              fullWidth
              label="Description"
              margin="normal"
              multiline
              rows={3}
              {...register('description')}
            />
            <TextField
              fullWidth
              label="Price (₹)"
              type="number"
              margin="normal"
              {...register('price', { required: true })}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              margin="normal"
              {...register('quantity', { required: true })}
            />
            <TextField
              fullWidth
              label="Manufacturer"
              margin="normal"
              {...register('manufacturer')}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingMedicine ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PharmacistDashboard;