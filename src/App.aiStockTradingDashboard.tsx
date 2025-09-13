import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import system from './theme';
import { Dashboard } from './components/dashboard/Dashboard';

function App() {
  return (
    <ChakraProvider value={system}>
      <Dashboard />
    </ChakraProvider>
  );
}

export default App;