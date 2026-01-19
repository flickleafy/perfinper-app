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

import TransactionsImporter from './components/TransactionsImporter/TransactionsImporter.js';
import TransactionsExporter from './components/TransactionsExporter/TransactionsExporter.js';
import TransactionsList from './components/TransactionsList/TransactionsList.js';
import InsertTransaction from './components/InsertTransaction/InsertTransaction.js';
import EditTransaction from './components/EditTransaction/EditTransaction.js';
import CompaniesList from './components/CompaniesList/CompaniesList.js';
import InsertCompany from './components/InsertCompany/InsertCompany.js';
import EditCompany from './components/EditCompany/EditCompany.js';
import PeopleList from './components/PeopleList/PeopleList.js';
import InsertPerson from './components/InsertPerson/InsertPerson.js';
import EditPerson from './components/EditPerson/EditPerson.js';
import FiscalBooksList from './components/FiscalBooksList/FiscalBooksList.js';
import InsertFiscalBook from './components/InsertFiscalBook/InsertFiscalBook.js';
import EditFiscalBook from './components/EditFiscalBook/EditFiscalBook.js';

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
              to='/empresas'>
              Empresas
            </Button>            <Button
              color='inherit'
              component={Link}
              to='/pessoas'>
              Pessoas
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/livros-fiscais'>
              Livros Fiscais
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/importar'>
              Importar Transações
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/exportar'>
              Exportar Transações
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
              path='/empresas'
              element={<CompaniesList />}
            />            <Route
              path='/empresas/inserir'
              element={<InsertCompany />}
            />
            <Route
              path='/empresas/editar/:id'
              element={<EditCompany />}
            />
            <Route
              path='/pessoas'
              element={<PeopleList />}
            />
            <Route
              path='/pessoas/inserir'
              element={<InsertPerson />}
            />            <Route
              path='/pessoas/editar/:id'
              element={<EditPerson />}
            />
            <Route
              path='/livros-fiscais'
              element={<FiscalBooksList />}
            />
            <Route
              path='/livros-fiscais/inserir'
              element={<InsertFiscalBook />}
            />
            <Route
              path='/livros-fiscais/editar/:id'
              element={<EditFiscalBook />}
            />
            <Route
              path='/importar'
              element={<TransactionsImporter />}
            />
            <Route
              path='/exportar'
              element={<TransactionsExporter />}
            />
          </Routes>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
