import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SimulationContainer from './components/SimulationContainer';
import { SimulationProvider } from './contexts/SimulationContext';

function App() {
  // Theme state for light/dark mode
  const [mode, setMode] = useState('light');

  const theme = createTheme({
    palette: {
      mode,
      primary: {
        main: mode === 'light' ? '#1976d2' : '#90caf9',
      },
      secondary: {
        main: mode === 'light' ? '#f50057' : '#f48fb1',
      },
      background: {
        default: mode === 'light' ? '#f5f5f5' : '#303030',
        paper: mode === 'light' ? '#ffffff' : '#424242',
      },
    },
  });

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimulationProvider>
        <Container maxWidth="lg">
          <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>
          
          <Box sx={{ my: 4 }}>
            <SimulationContainer />
          </Box>
        </Container>
      </SimulationProvider>
    </ThemeProvider>
  );
}

export default App;
// Trigger rebuild Thu Sep  4 13:02:55 EDT 2025
