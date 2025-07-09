import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Button,
  Typography,
  TextField,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import fiscalBookService from '../../services/fiscalBookService.js';
import http from '../../infrastructure/http/http-common.js';

const TransactionsExporter = () => {
  const [fileName, setFileName] = useState('');
  const [fileDownloadUrl, setFileDownloadUrl] = useState(null);
  const [error, setError] = useState('');
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [selectedFiscalBook, setSelectedFiscalBook] = useState('');

  useEffect(() => {
    const fetchFiscalBooks = async () => {
      try {
        const books = await fiscalBookService.getAll();
        setFiscalBooks(books);
      } catch (error) {
        console.error('Error fetching fiscal books:', error);
      }
    };
    fetchFiscalBooks();
  }, []);

  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  const handleExport = async () => {
    if (!fileName) {
      setError('Please enter a file name to save the export');
      return;
    }
    if (!selectedFiscalBook) {
      setError('Please select a fiscal book to export');
      return;
    }
    setError(''); // Reset error message before the operation
    try {
      let data;
      const response = await http.get(
        `/api/export/fiscal-book/${selectedFiscalBook}/json`
      );
      data = response.data;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      if (fileDownloadUrl) window.URL.revokeObjectURL(fileDownloadUrl); // Clean up the previous URL
      const downloadUrl = window.URL.createObjectURL(blob);
      setFileDownloadUrl(downloadUrl);
    } catch (error) {
      setError(`Failed to export data. Error: ${error.message}`);
      setFileDownloadUrl(null);
    }
  };

  const handleCloseSnackbar = () => {
    setError('');
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>
      <Grid
        container
        spacing={2}>
        <Grid
          item
          xs={12}>
          <Typography
            variant='h4'
            gutterBottom>
            Exportar Transações
          </Typography>
        </Grid>
        <Grid
          item
          xs={6}>
          <TextField
            fullWidth
            label='Enter file name'
            value={fileName}
            onChange={handleFileNameChange}
            helperText='File will be saved as JSON'
          />
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
          <Button
            variant='contained'
            component='span'
            onClick={handleExport}
            disabled={!fileName || !selectedFiscalBook}>
            Exportar
          </Button>
          {fileDownloadUrl && (
            <Typography
              variant='body2'
              sx={{ mt: 2 }}>
              <a
                href={fileDownloadUrl}
                download={`${fileName}.json`}>
                Click here to download the file
              </a>
            </Typography>
          )}
        </Grid>
      </Grid>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={error}
      />
    </Box>
  );
};

export default TransactionsExporter;
