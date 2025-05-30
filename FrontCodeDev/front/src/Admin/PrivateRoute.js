import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { 
  Button, 
  Container, 
  Typography, 
  Box, 
  useTheme 
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import CodeIcon from '@mui/icons-material/Code';
import { motion } from 'framer-motion';

// ========================
// 🔒 SecureRoute Component
// ========================
export const SecureRoute = ({ children, requiredRole = 'admin' }) => {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role !== requiredRole) {
    return <Forbidden403 />; // Render the 403 page directly
  }

  return children;
};

// ========================
// 🚫 403 Forbidden Page (Internal Component)
// ========================
const Forbidden403 = () => {
  const theme = useTheme();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 10 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            mb: 6,
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
              '100%': { transform: 'scale(1)' },
            },
          }}
        >
          <LockIcon sx={{ fontSize: 100, color: 'error.main' }} />
        </Box>

        <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
          403 - Access Denied
        </Typography>
        
        <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary' }}>
          <CodeIcon sx={{ mr: 1 }} />
          You don't have admin privileges to view this page.
        </Typography>

        <Typography variant="body1" sx={{ mb: 4 }}>
          If you believe this is a mistake, contact support or return to the homepage.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            component="a"
            href="/"
            sx={{ px: 4 }}
          >
            Back to Home
          </Button>
          
          <Button
            variant="outlined"
            component="a"
            href="/docs"
            sx={{ px: 4 }}
          >
            View Documentation
          </Button>
          
          <Button
            variant="text"
            component="a"
            href="/contact"
            sx={{ px: 4 }}
          >
            Contact Support
          </Button>
        </Box>
      </motion.div>
    </Container>
  );
};

export default SecureRoute;