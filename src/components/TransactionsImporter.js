import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Grid,
  Box,
  useTheme,
} from '@mui/material';
import {
  importFlashTransactions,
  importMercadolivreTransactions,
  importNubankTransactions,
} from '../services/importService.js';

//List Elements
import LoadingIndicator from './LoadingIndicator.js';

const TransactionsImporter = () => {
  const theme = useTheme();
  const [fullTransactionsList, setFullTransactionsList] = useState([]);
  const [transactionsPrintList, setTransactionsPrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');
  const [categories, setCategories] = useState([]);

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}></Box>
  );
};

export default TransactionsImporter;
