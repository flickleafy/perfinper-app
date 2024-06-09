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
  Backdrop,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
  const [selectedImporter, setSelectedImporter] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragging, setDragging] = useState(false);

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
            disabled={!selectedFile || !selectedImporter}>
            Importar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionsImporter;
