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
} from '../../redux/pharmacySlice';

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
const PharmacistDashBoard = () => {
  const dispatch = useDispatch();

  // Redux state
  const medicines = useSelector(selectMedicines);
  const prescriptions = useSelector(selectPrescriptions);
  const loading = useSelector(selectPharmacyLoading);

  // ✅ SAFE ARRAYS
  const safeMedicines = Array.isArray(medicines) ? medicines : [];
  const safePrescriptions = Array.isArray(prescriptions) ? prescriptions : [];

  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);

  const { register, handleSubmit, reset, setValue } = useForm();

  /* -------------------- Effects -------------------- */
  useEffect(() => {
    dispatch(fetchMedicines());
    dispatch(fetchPrescriptions());
  }, [dispatch]);

  /* -------------------- Helpers -------------------- */
  const getPrescriptionStatusColor = (status = '') => {
    switch (status.toLowerCase()) {
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

  const lowStockCount = safeMedicines.filter(
    (m) => (m?.quantity ?? 0) < 10
  ).length;

  const totalInventoryValue = safeMedicines.reduce(
    (sum, m) => sum + (m?.price ?? 0) * (m?.quantity ?? 0),
    0
  );

  /* -------------------- Dialog -------------------- */
  const handleOpenDialog = (medicine = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setValue('name', medicine?.name || '');
      setValue('description', medicine?.description || '');
      setValue('price', medicine?.price ?? '');
      setValue('quantity', medicine?.quantity ?? '');
      setValue('manufacturer', medicine?.manufacturer || '');
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

  /* -------------------- Actions -------------------- */
  const onSubmit = async (data) => {
    if (editingMedicine?.id) {
      await dispatch(updateMedicine({ id: editingMedicine.id, medicineData: data }));
    } else {
      await dispatch(createMedicine(data));
    }
    handleCloseDialog();
    dispatch(fetchMedicines());
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      await dispatch(deleteMedicine(id));
      dispatch(fetchMedicines());
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Pharmacist Dashboard
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage medicines, prescriptions, and inventory
      </Typography>

      {/* Stats */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Medicines"
            value={safeMedicines.length}
            icon={<MedicationIcon sx={{ color: '#fff' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Prescriptions"
            value={safePrescriptions.length}
            icon={<AssignmentIcon sx={{ color: '#fff' }} />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Low Stock Items"
            value={lowStockCount}
            icon={<InventoryIcon sx={{ color: '#fff' }} />}
            color="error"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Inventory Value"
            value={`₹${totalInventoryValue.toFixed(2)}`}
            icon={<TrendingUpIcon sx={{ color: '#fff' }} />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label="Medicines" />
          <Tab label="Prescriptions" />
        </Tabs>
      </Paper>

      {/* Medicines */}
      {tabValue === 0 && (
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Medicine Inventory</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
              Add Medicine
            </Button>
          </Box>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">Loading...</TableCell>
                </TableRow>
              ) : safeMedicines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No medicines found
                  </TableCell>
                </TableRow>
              ) : (
                safeMedicines.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m?.name || 'N/A'}</TableCell>
                    <TableCell>{m?.description || 'N/A'}</TableCell>
                    <TableCell>₹{m?.price ?? 0}</TableCell>
                    <TableCell>{m?.quantity ?? 0}</TableCell>
                    <TableCell>{m?.manufacturer || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={(m?.quantity ?? 0) < 10 ? 'Low Stock' : 'In Stock'}
                        color={(m?.quantity ?? 0) < 10 ? 'error' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(m)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(m.id)}>
                        <DeleteIcon />
                      </IconButton>
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
          <Typography variant="h6" gutterBottom>
            Prescriptions to Dispense
          </Typography>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Medicines</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">Loading...</TableCell>
                </TableRow>
              ) : safePrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No prescriptions found
                  </TableCell>
                </TableRow>
              ) : (
                safePrescriptions.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>#{p.id}</TableCell>
                    <TableCell>{p?.patientName || 'N/A'}</TableCell>
                    <TableCell>{p?.doctorName || 'N/A'}</TableCell>
                    <TableCell>{p?.medicines?.join(', ') || 'N/A'}</TableCell>
                    <TableCell>
                      {p?.date ? new Date(p.date).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={p?.status || 'Pending'}
                        color={getPrescriptionStatusColor(p?.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField fullWidth label="Name" margin="normal" {...register('name', { required: true })} />
            <TextField fullWidth label="Description" margin="normal" multiline rows={3} {...register('description')} />
            <TextField fullWidth type="number" label="Price" margin="normal" {...register('price', { required: true })} />
            <TextField fullWidth type="number" label="Quantity" margin="normal" {...register('quantity', { required: true })} />
            <TextField fullWidth label="Manufacturer" margin="normal" {...register('manufacturer')} />
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

export default PharmacistDashBoard;
