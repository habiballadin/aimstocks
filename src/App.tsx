import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Dashboard } from './components/dashboard/Dashboard';
import { theme } from './theme';
import './App.css';

function App() {
  return (
    <ChakraProvider value={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;