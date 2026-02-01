
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { registerUser, selectAuthLoading, selectAuthError } from '../../redux/authSlice';
import { USER_ROLES, ROLE_LABELS } from '../../utils/Constant';

// Validation schema
const schema = yup.object().shape({
  username: yup.string().required('Username is required').min(3, 'Minimum 3 characters'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(6, 'Minimum 6 characters'),
  firstName: yup.string().required('First name is required'),
  lastname: yup.string().required('Last name is required'),
  phone: yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  role: yup.string().required('Role is required'),
});

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: USER_ROLES.PATIENT,
    },
  });

  const onSubmit = async (data) => {
    const result = await dispatch(registerUser(data));
    
    if (registerUser.fulfilled.match(result)) {
      // Registration successful
      navigate('/dashboard');
    }
    // Error handling is done in the slice with toast
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Register for Medical Management System
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Username"
              margin="normal"
              {...register('username')}
              error={!!errors.username}
              helperText={errors.username?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="First Name"
              margin="normal"
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Last Name"
              margin="normal"
              {...register('lastname')}
              error={!!errors.lastname}
              helperText={errors.lastname?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Phone"
              margin="normal"
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              disabled={loading}
            />

            <TextField
              fullWidth
              select
              label="Role"
              margin="normal"
              {...register('role')}
              error={!!errors.role}
              helperText={errors.role?.message}
              disabled={loading}
            >
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none', color: '#1976d2' }}>
                  Login here
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;