import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { theme } from './theme';
import { OrderManagementDashboard } from './components/orderManagement/OrderManagementDashboard';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', p: 2 }}>
        <OrderManagementDashboard />
      </Box>
    </ThemeProvider>
  );
}

export default App;