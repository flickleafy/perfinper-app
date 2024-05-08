import React from 'react';
import { Routes, Route, BrowserRouter, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Button,
  Box,
  CssBaseline,
} from '@mui/material';
import { Home } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blueGrey, teal, red, brown, common } from '@mui/material/colors';

import TransactionsImporter from './components/TransactionsImporter.js';
import TransactionsList from './components/TransactionsList.js';
import InsertTransaction from './components/InsertTransaction.js';
import EditTransaction from './components/EditTransaction.js';

// Create a theme instance.
const theme = createTheme({
  shape: {
    borderRadius: 3,
  },
  palette: {
    primary: {
      main: blueGrey[600],
      light: blueGrey[50],
    },
    secondary: {
      main: teal[600],
      light: teal[50],
    },
    error: {
      main: red[800],
      light: red[100],
    },
    background: {
      default: common.white,
      paper: brown[50],
    },
  },
  typography: {
    fontFamily: [
      'Fira Sans', // Primary font
      'Roboto', // Fallback font
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Define your typography adjustments here
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar
          position='static'
          color='primary'
          sx={{ zIndex: 3 }}>
          <Toolbar>
            <IconButton
              size='large'
              edge='start'
              color='inherit'
              aria-label='home'>
              <Home />
            </IconButton>
            <Button
              color='inherit'
              component={Link}
              to='/lista'>
              Transações
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/inserir'>
              Nova Transação
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/importar'>
              Importar Transações
            </Button>
          </Toolbar>
        </AppBar>
        <Box
          component='div'
          className='container'
          sx={{ marginTop: 2 }}>
          <Routes>
            <Route
              path='/'
              element={<TransactionsList />}
            />
            <Route
              path='/lista'
              element={<TransactionsList />}
            />
            <Route
              path='/inserir'
              element={<InsertTransaction />}
            />
            <Route
              path='/editar/:id'
              element={<EditTransaction />}
            />
            <Route
              path='/importar'
              element={<TransactionsImporter />}
            />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
