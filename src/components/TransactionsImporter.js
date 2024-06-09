import React, { useState } from 'react';
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
} from '@mui/material';
import {
  importFlashTransactions,
  importMercadolivreTransactions,
  importNubankTransactions,
  importNubankCreditTransactions,
  importDigioCreditTransactions,
} from '../services/importService.js';
import { csvToJson } from '../infrastructure/fileFormat/csvToJson.js';
import { convertObjectToArray } from '../infrastructure/object/convertObjectToArray.js';

const TransactionsImporter = () => {
  const [selectedImporter, setSelectedImporter] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDragOver = (event) => {
    event.preventDefault(); // Necessary to allow drop
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json' || file.type === 'text/csv') {
        setSelectedFile(file);
      } else {
        alert('Unsupported file format. Please select a JSON or CSV file.');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      return alert('Please select a file to import');
    }
    console.log('handle', selectedFile);
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
          return alert(
            'Unsupported file format. Please select a JSON or CSV file.'
          );
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error reading file. Please try again.');
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
          return alert('Please select a valid importer');
      }
      await importFunction(data);
    };
    reader.onerror = (error) =>
      alert('Error reading file', JSON.stringify(error, null, 4));
  };

  return (
    <Box
      sx={{ paddingLeft: 8, paddingRight: 8 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}>
      <Grid
        container
        spacing={2}>
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
          {selectedFile && (
            <Typography
              variant='body2'
              sx={{ mt: 2 }}>
              File: {selectedFile.name}
            </Typography>
          )}
        </Grid>
        <Grid
          item
          xs={6}>
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
            disabled={!selectedFile}>
            Importar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionsImporter;
