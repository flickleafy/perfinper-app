import React, { useState } from 'react';
import {
  Grid,
  Box,
  Button,
  Typography,
  TextField,
  Snackbar,
} from '@mui/material';
import { exportTransactions } from '../../services/exportService.js';

const TransactionsExporter = () => {
  const [fileName, setFileName] = useState('');
  const [fileDownloadUrl, setFileDownloadUrl] = useState(null);
  const [error, setError] = useState('');

  const handleFileNameChange = (event) => {
    setFileName(event.target.value);
  };

  const handleExport = async () => {
    if (!fileName) {
      setError('Please enter a file name to save the export');
      return;
    }
    setError(''); // Reset error message before the operation
    try {
      const { data } = await exportTransactions(2023); // Fetch data from the API
      const isValidJSON = JSON.parse(JSON.stringify(data)); // Attempt to validate JSON data
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
          <Button
            variant='contained'
            component='span'
            onClick={handleExport}
            disabled={!fileName}>
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
