import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Outlet />
      </Container>
    </Box>
  );
};

export default AuthLayout;