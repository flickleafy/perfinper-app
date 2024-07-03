import React, { useState } from 'react';
import {
  Grid,
  Box,
  FormControl,
  InputLabel,
  Button,
  Typography,
} from '@mui/material';
import { exportTransactions } from '../../services/exportService.js';

const TransactionsExporter = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleExport = async () => {
    if (!selectedFile) {
      return alert('Please select a file to save the export');
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
        } else {
          return alert(
            'Unsupported file format. Please select a JSON or CSV file.'
          );
        }
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error writting file. Please try again.');
        return;
      }
      await exportTransactions(data);
    };
    reader.onerror = (error) =>
      alert('Error writting file', JSON.stringify(error, null, 4));
  };

  return (
    <Box>
      <Grid
        container
        spacing={2}>
        <Grid
          item
          xs={6}>
          <FormControl fullWidth>
            <InputLabel id='importer-select-label'>Importer</InputLabel>
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
            accept='.json'
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
            onClick={handleExport}
            disabled={!selectedFile}>
            Exportar
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TransactionsExporter;
