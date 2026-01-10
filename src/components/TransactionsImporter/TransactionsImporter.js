import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Backdrop,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  importFlashTransactions,
  importMercadolivreTransactions,
  importNubankTransactions,
  importNubankCreditTransactions,
  importDigioCreditTransactions,
} from '../../services/importService.js';
import fiscalBookService from '../../services/fiscalBookService.js';
import { csvToJson } from '../../infrastructure/fileFormat/csvToJson.js';
import { convertObjectToArray } from '../../infrastructure/object/convertObjectToArray.js';
import { useToast } from '../../ui/ToastProvider.js';

const TransactionsImporter = ({ initialImporter = '' }) => {
  const { showToast } = useToast();
  const [selectedImporter, setSelectedImporter] = useState(initialImporter);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [selectedFiscalBook, setSelectedFiscalBook] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFiscalBooks = async () => {
      try {
        const books = await fiscalBookService.getAll();
        // Filter to show only open fiscal books
        const openBooks = books.filter((book) => book.status === 'Aberto');
        setFiscalBooks(openBooks);
      } catch (error) {
        console.error('Error fetching fiscal books:', error);
      }
    };
    fetchFiscalBooks();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDragOverAndEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setDragging(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.type === 'text/csv') {
        setSelectedFile(file);
      } else {
        showToast(
          'Unsupported file format. Please select a JSON or CSV file.',
          'error'
        );
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      showToast('Please select a file to import', 'error');
      return;
    }
    if (!selectedFiscalBook) {
      showToast(
        'Please select an open fiscal book to import transactions',
        'error'
      );
      return;
    }
    console.log('handle', selectedFile);
    setLoading(true);
    const reader = new FileReader();
    reader.readAsText(selectedFile);
    reader.onload = async (e) => {
      let data = null;
      // Get file type from selectedFile
      const fileType = selectedFile.type;

      try {
        if (fileType.includes('json')) {
          // Check if file type includes "json"
          data = JSON.parse(e.target.result);
          if (selectedImporter === 'flash') {
            data = convertObjectToArray(data);
          }
        } else if (fileType.includes('csv')) {
          // Parse the CSV data
          data = csvToJson(e.target.result);
        } else {
          showToast(
            'Unsupported file format. Please select a JSON or CSV file.',
            'error'
          );
          return;
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        showToast('Error reading file. Please try again.', 'error');
        setLoading(false);
        return;
      }

      let importFunction;
      switch (selectedImporter) {
        case 'nubank':
          importFunction = importNubankTransactions;
          break;
        case 'nubank-credit':
          importFunction = importNubankCreditTransactions;
          break;
        case 'digio-credit':
          importFunction = importDigioCreditTransactions;
          break;
        case 'mercadolivre':
          importFunction = importMercadolivreTransactions;
          break;
        case 'flash':
          importFunction = importFlashTransactions;
          break;
        default:
          setLoading(false);
          showToast('Please select a valid importer', 'error');
          return;
      }
      try {
        const response = await importFunction(data, selectedFiscalBook);
        showToast(
          response?.data?.message || 'Importacao concluida com sucesso.',
          'success'
        );
      } catch (error) {
        console.error('Error importing transactions:', error);
        showToast(
          error?.response?.data?.message || 'Falha ao importar transacoes.',
          'error'
        );
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      showToast('Error reading file. Please try again.', 'error');
      setLoading(false);
    };
  };

  return (
    <Box
      sx={{
        position: 'relative',
        paddingLeft: 8,
        paddingRight: 8,
        minHeight: 300,
      }}
      onDragOver={handleDragOverAndEnter}
      onDragEnter={handleDragOverAndEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}>
      {dragging && (
        <Backdrop
          open={true}
          sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent backdrop
          }}>
          <CloudUploadIcon sx={{ fontSize: 60 }} />
          <Typography variant='h6'>Drop file here</Typography>
        </Backdrop>
      )}
      <Grid
        container
        spacing={2}>
        <Grid
          item
          xs={12}>
          <Typography
            variant='h4'
            gutterBottom>
            Importar Transações
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}>
          <FormControl fullWidth>
            <InputLabel id='importer-select-label'>Importer</InputLabel>
            <Select
              labelId='importer-select-label'
              id='importer-select'
              value={selectedImporter}
              label='Importer'
              onChange={(event) => setSelectedImporter(event.target.value)}>
              <MenuItem value='nubank'>Nubank</MenuItem>
              <MenuItem value='nubank-credit'>Nubank - Crédito</MenuItem>
              <MenuItem value='digio-credit'>Digio - Crédito</MenuItem>
              <MenuItem value='mercadolivre'>Mercado Livre</MenuItem>
              <MenuItem value='flash'>Flash</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={6}>
          <FormControl fullWidth>
            <InputLabel id='fiscal-book-select-label'>Fiscal Book</InputLabel>
            <Select
              labelId='fiscal-book-select-label'
              id='fiscal-book-select'
              value={selectedFiscalBook}
              label='Fiscal Book'
              onChange={(e) => setSelectedFiscalBook(e.target.value)}>
              {fiscalBooks.map((book) => (
                <MenuItem
                  key={book.id}
                  value={book.id}>
                  {book.bookName} ({book.bookPeriod})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid
          item
          xs={12}>
          {selectedFile && (
            <Typography
              variant='body2'
              sx={{ mt: 2, mb: 2 }}>
              File: {selectedFile.name}
            </Typography>
          )}
          <input
            type='file'
            accept='.json, .csv'
            hidden
            id='file-input'
            onChange={handleFileChange}
          />
          <label htmlFor='file-input'>
            <Button
              variant='contained'
              component='span'
              sx={{ marginRight: 1 }}>
              Selecionar arquivo
            </Button>
          </label>
          <Button
            variant='contained'
            color='primary'
            onClick={handleImport}
            disabled={
              !selectedFile ||
              !selectedImporter ||
              !selectedFiscalBook ||
              loading
            }>
            {loading ? (
              <CircularProgress
                size={20}
                color='inherit'
              />
            ) : (
              'Importar'
            )}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionsImporter;
