import React from 'react';
import { Link } from 'react-router-dom';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
} from '@mui/material';
import { Home } from '@mui/icons-material';

import TransactionsList from './components/TransactionsList.js';
import InsertTransaction from './components/InsertTransaction.js';
import EditTransaction from './components/EditTransaction.js';

function App() {
  return (
    <BrowserRouter>
      <Box>
        <AppBar
          position='static'
          color='primary'
          sx={{ zIndex: 3 }}>
          <Toolbar>
            <IconButton
              size='large'
              edge='start'
              color='inherit'
              aria-label='home'
              sx={{ mr: 2 }}>
              <Home />
            </IconButton>
            <Typography
              variant='h6'
              component='div'
              sx={{ flexGrow: 1 }}>
              My App
            </Typography>
            <Button
              color='inherit'
              component={Link}
              to='/lista'>
              Lançamentos
            </Button>
            <Button
              color='inherit'
              component={Link}
              to='/inserir'>
              Novo Lançamento
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
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
