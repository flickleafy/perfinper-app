import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tab,
  Tabs,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Info as InfoIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon,
  GetApp as ExportIcon,
  Edit as EditIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Receipt as ReceiptIcon,
  CameraAlt as CameraIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import fiscalBookService from '../../services/fiscalBookService';
import { 
  formatFiscalBookForDisplay, 
} from '../fiscalBookPrototype';
import LoadingIndicator from '../../ui/LoadingIndicator';
import SnapshotsList from '../SnapshotsList/SnapshotsList';
import SnapshotScheduleForm from '../SnapshotScheduleForm/SnapshotScheduleForm';

/**
 * TabPanel - Helper component for tab content
 */
function TabPanel({ children, value, index, ...other }) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`fiscal-book-tabpanel-${index}`}
      aria-labelledby={`fiscal-book-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </Box>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

/**
 * FiscalBookDrawer - Side drawer for viewing fiscal book details
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether drawer is open
 * @param {Function} props.onClose - Callback when drawer is closed
 * @param {Object} props.fiscalBook - Fiscal book to display
 * @param {Function} props.onEdit - Callback when edit is requested
 * @param {Function} props.onRefresh - Callback when refresh is needed
 * @param {number} props.initialTab - Initial tab to open (0=Overview, 1=Transactions, 2=Statistics)
 */
function FiscalBookDrawer({ open, onClose, fiscalBook, onEdit, onRefresh, initialTab = 0 }) {
  const [tabValue, setTabValue] = useState(initialTab);
  const [statistics, setStatistics] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');

  // Reset tab when initialTab changes
  useEffect(() => {
    setTabValue(initialTab);
  }, [initialTab]);

  // Load statistics when fiscal book changes
  useEffect(() => {
    if (fiscalBook && open) {
      loadStatistics();
    }
  }, [fiscalBook, open]);

  // Load transactions when switching to transactions tab
  useEffect(() => {
    if (fiscalBook && open && tabValue === 1) {
      loadTransactions();
    }
  }, [fiscalBook, open, tabValue]);

  // Load fiscal book statistics
  const loadStatistics = async () => {
    if (!fiscalBook?._id) return;

    try {
      setLoadingStats(true);
      setStatsError('');
      // Note: Backend only provides overall statistics, not per fiscal book
      const stats = await fiscalBookService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatsError('Failed to load statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  // Load fiscal book transactions
  const loadTransactions = async () => {
    if (!fiscalBook?._id) return;

    try {
      setLoadingTransactions(true);
      setTransactionsError('');
      const result = await fiscalBookService.getTransactions(fiscalBook._id, {
        limit: 10,
        sort: 'createdAt',
        order: 'desc'
      });
      setTransactions(result.transactions || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactionsError('Failed to load transactions');
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle close/reopen
  const handleToggleStatus = async () => {
    if (!fiscalBook) return;

    try {
      if (fiscalBook.status === 'Fechado') {
        await fiscalBookService.reopen(fiscalBook._id);
      } else {
        await fiscalBookService.close(fiscalBook._id);
      }
      
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error toggling fiscal book status:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!fiscalBook) return;

    try {
      const blob = await fiscalBookService.export(fiscalBook._id, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiscal-book-${fiscalBook.bookName || fiscalBook.name}-${fiscalBook.bookPeriod || fiscalBook.year}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting fiscal book:', error);
    }
  };

  // Get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Aberto':
        return 'success';
      case 'Fechado':
        return 'warning';
      case 'Em Revisão':
        return 'info';
      case 'Arquivado':
        return 'default';
      default:
        return 'default';
    }
  };

  // Get status chip label
  const getStatusChipLabel = (status) => {
    return status || 'Desconhecido';
  };

  // Render transactions content
  const renderTransactionsContent = () => {
    if (loadingTransactions) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading transactions...
          </Typography>
        </Box>
      );
    }

    if (transactionsError) {
      return (
        <Alert severity="error">
          {transactionsError}
        </Alert>
      );
    }

    if (transactions.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found in this fiscal book
          </Typography>
        </Box>
      );
    }

    return (
      <List>
        {transactions.map((transaction, index) => (
          <ListItem key={transaction._id || index} divider>
            <ListItemText
              primary={transaction.transactionName || 'Unnamed Transaction'}
              secondary={`${transaction.transactionValue} - ${transaction.transactionDate}`}
            />
          </ListItem>
        ))}
      </List>
    );
  };

  // Render statistics content
  const renderStatisticsContent = () => {
    if (loadingStats) {
      return <LoadingIndicator message="Loading statistics..." />;
    }

    if (statsError) {
      return (
        <Alert severity="error">
          {statsError}
        </Alert>
      );
    }

    if (statistics) {
      return (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Detailed Statistics
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Alert severity="info">
              Detailed statistics feature is coming soon.
            </Alert>
          </Grid>
        </Grid>
      );
    }

    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No statistics available
        </Typography>
      </Box>
    );
  };

  if (!fiscalBook) {
    return null;
  }

  const formattedBook = formatFiscalBookForDisplay(fiscalBook);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 500, md: 600 } }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flexGrow: 1, mr: 2 }}>
              <Typography variant="h5" component="h2" gutterBottom>
                {formattedBook.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Chip
                  label={getStatusChipLabel(formattedBook.status)}
                  color={getStatusChipColor(formattedBook.status)}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Year: {formattedBook.year}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Grid container spacing={1}>
            <Grid item>
              <Button
                size="small"
                startIcon={<EditIcon />}
                onClick={() => onEdit && onEdit(formattedBook)}
                disabled={!formattedBook.isEditable}
              >
                Edit
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="small"
                startIcon={formattedBook.status === 'Fechado' ? <UnarchiveIcon /> : <ArchiveIcon />}
                onClick={handleToggleStatus}
              >
                {formattedBook.status === 'Fechado' ? 'Reabrir' : 'Fechar'}
              </Button>
            </Grid>
            <Grid item>
              <Button
                size="small"
                startIcon={<ExportIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Overview" icon={<InfoIcon />} />
            <Tab label="Transactions" icon={<ReceiptIcon />} />
            <Tab label="Statistics" icon={<AssessmentIcon />} />
            <Tab label="Snapshots" icon={<CameraIcon />} />
            <Tab label="Settings" icon={<SettingsIcon />} />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Name"
                          secondary={formattedBook.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Year"
                          secondary={formattedBook.year}
                        />
                      </ListItem>
                      {formattedBook.description && (
                        <ListItem>
                          <ListItemText
                            primary="Description"
                            secondary={formattedBook.description}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemText
                          primary="Status"
                          secondary={getStatusChipLabel(formattedBook.status)}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Financial Summary */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Financial Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="success.main">
                            {formattedBook.formattedTotalIncome}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Income
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="error.main">
                            {formattedBook.formattedTotalExpenses}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Expenses
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ textAlign: 'center', p: 1 }}>
                          <Typography variant="h4" color="text.primary">
                            {formattedBook.formattedNetAmount}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Net Amount
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Metadata */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Metadata
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Created"
                          secondary={formattedBook.createdAtFormatted}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <HistoryIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Last Updated"
                          secondary={formattedBook.updatedAtFormatted}
                        />
                      </ListItem>
                      {formattedBook.closedAtFormatted && (
                        <ListItem>
                          <ListItemIcon>
                            <ArchiveIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary="Closed"
                            secondary={formattedBook.closedAtFormatted}
                          />
                        </ListItem>
                      )}
                      <ListItem>
                        <ListItemIcon>
                          <ReceiptIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="Transactions"
                          secondary={`${formattedBook.transactionCount} transaction(s)`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Transactions Tab */}
          <TabPanel value={tabValue} index={1}>
            {renderTransactionsContent()}
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={2}>
            {renderStatisticsContent()}
          </TabPanel>

          {/* Snapshots Tab */}
          <TabPanel value={tabValue} index={3}>
            <SnapshotsList
              fiscalBookId={fiscalBook?._id || fiscalBook?.id}
              fiscalBookName={formattedBook.name}
              onSnapshotCreated={() => {
                // Optionally refresh data
                if (onRefresh) onRefresh();
              }}
            />
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" gutterBottom>
              Snapshot Settings
            </Typography>
            <SnapshotScheduleForm
              fiscalBookId={fiscalBook?._id || fiscalBook?.id}
              onSave={() => {
                // Schedule saved
              }}
            />
          </TabPanel>
        </Box>
      </Box>
    </Drawer>
  );
}

FiscalBookDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fiscalBook: PropTypes.shape({
    _id: PropTypes.string,
    id: PropTypes.string,
    bookName: PropTypes.string,
    bookType: PropTypes.string,
    bookPeriod: PropTypes.string,
    reference: PropTypes.string,
    status: PropTypes.string,
    notes: PropTypes.string,
    fiscalData: PropTypes.object,
    companyId: PropTypes.string,
    isEditable: PropTypes.bool,
    transactionCount: PropTypes.number,
    totalIncome: PropTypes.number,
    totalExpenses: PropTypes.number,
    netAmount: PropTypes.number,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string,
    closedAt: PropTypes.string,
    // Legacy field support for compatibility
    name: PropTypes.string,
    year: PropTypes.number,
    description: PropTypes.string,
  }),
  onEdit: PropTypes.func,
  onRefresh: PropTypes.func,
  initialTab: PropTypes.number,
};

FiscalBookDrawer.defaultProps = {
  fiscalBook: null,
  onEdit: null,
  onRefresh: null,
  initialTab: 0,
};

export default FiscalBookDrawer;
