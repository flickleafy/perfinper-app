import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatFiscalBookForDisplay,
  FISCAL_BOOK_STATUS_OBJ,
  filterFiscalBooks,
  sortFiscalBooks,
  isFiscalBookEditable,
} from '../fiscalBookPrototype';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  Delete as DeleteIcon,
  GetApp as ExportIcon,
  Assessment as StatsIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import fiscalBookService from '../../services/fiscalBookService';
import LoadingIndicator from '../../ui/LoadingIndicator';
import FiscalBookDrawer from '../FiscalBookDrawer/FiscalBookDrawer';

/**
 * FiscalBooksList - Component for displaying and managing fiscal books
 * @param {Object} props - Component props
 * @param {Function} props.onCreateNew - Callback when creating new fiscal book
 * @param {Function} props.onEdit - Callback when editing fiscal book
 * @param {Function} props.onView - Callback when viewing fiscal book details
 * @param {boolean} props.allowCreate - Whether to show create button
 * @param {boolean} props.allowEdit - Whether to allow editing
 * @param {boolean} props.allowDelete - Whether to allow deletion
 */
function FiscalBooksList({ 
  onCreateNew, 
  onEdit, 
  onView, 
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
}) {
  const navigate = useNavigate();
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [sortBy, setSortBy] = useState('bookPeriod');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fiscal book drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerFiscalBook, setDrawerFiscalBook] = useState(null);
  const [drawerInitialTab, setDrawerInitialTab] = useState(0);

  // Load fiscal books
  const loadFiscalBooks = async () => {
    try {
      setLoading(true);
      setError('');
      const books = await fiscalBookService.getAll();
      setFiscalBooks(books.map(formatFiscalBookForDisplay));
    } catch (err) {
      console.error('Error loading fiscal books:', err);
      setError('Failed to load fiscal books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load fiscal books on component mount
  useEffect(() => {
    loadFiscalBooks();
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, book) => {
    setAnchorEl(event.currentTarget);
    setSelectedBook(book);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBook(null);
  };

  // Handle edit
  const handleEdit = (book = selectedBook) => {
    const bookToEdit = book || selectedBook;
    if (bookToEdit) {
      if (onEdit) {
        onEdit(bookToEdit);
      } else {
        navigate(`/livros-fiscais/editar/${bookToEdit.id || bookToEdit._id}`);
      }
    }
    handleMenuClose();
  };

  // Handle create new
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate('/livros-fiscais/inserir');
    }
  };

  // Handle view
  const handleView = (book = selectedBook, initialTab = 0) => {
    const bookToView = book || selectedBook;
    if (bookToView) {
      // If onView callback is provided, use it (for parent component control)
      if (onView) {
        onView(bookToView);
      } else {
        // Otherwise, open the drawer internally
        setDrawerFiscalBook(bookToView);
        setDrawerInitialTab(initialTab);
        setDrawerOpen(true);
      }
    }
    handleMenuClose();
  };

  // Handle view statistics
  const handleViewTransactions = (book = selectedBook) => {
    handleView(book, 1); // Open to transactions tab (index 1)
  };

  // Handle view statistics
  const handleViewStatistics = (book = selectedBook) => {
    handleView(book, 2); // Open to statistics tab (index 2)
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setDrawerFiscalBook(null);
    setDrawerInitialTab(0);
  };

  // Handle drawer edit
  const handleDrawerEdit = (book) => {
    handleEdit(book);
    handleDrawerClose();
  };

  // Handle archive/unarchive
  const handleToggleArchive = async () => {
    if (!selectedBook) return;

    try {
      if (selectedBook.status === FISCAL_BOOK_STATUS_OBJ.FECHADO) {
        await fiscalBookService.reopen(selectedBook.id || selectedBook._id);
      } else {
        await fiscalBookService.close(selectedBook.id || selectedBook._id);
      }
      await loadFiscalBooks();
    } catch (err) {
      console.error('Error toggling archive status:', err);
      setError('Failed to update fiscal book status');
    }
    handleMenuClose();
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    setBookToDelete(selectedBook);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  // Handle delete
  const handleDelete = async () => {
    if (!bookToDelete) return;

    try {
      setDeleting(true);
      await fiscalBookService.delete(bookToDelete.id || bookToDelete._id);
      await loadFiscalBooks();
      setDeleteDialogOpen(false);
      setBookToDelete(null);
    } catch (err) {
      console.error('Error deleting fiscal book:', err);
      setError('Failed to delete fiscal book');
    } finally {
      setDeleting(false);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!selectedBook) return;

    try {
      const blob = await fiscalBookService.export(selectedBook.id || selectedBook._id, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiscal-book-${selectedBook.bookName}-${selectedBook.bookPeriod}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting fiscal book:', err);
      setError('Failed to export fiscal book');
    }
    handleMenuClose();
  };

  // Filter and sort fiscal books
  const filteredAndSortedBooks = React.useMemo(() => {
    let filtered = filterFiscalBooks(fiscalBooks, {
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
      year: yearFilter === 'all' ? undefined : parseInt(yearFilter, 10),
    });

    return sortFiscalBooks(filtered, sortBy, sortOrder);
  }, [fiscalBooks, searchTerm, statusFilter, yearFilter, sortBy, sortOrder]);

  // Get unique years for filter
  const availableYears = React.useMemo(() => {
    const years = [...new Set(fiscalBooks.map(book => {
      // Extract year from bookPeriod (YYYY or YYYY-MM format)
      const period = book.bookPeriod || '';
      return period.includes('-') ? period.split('-')[0] : period;
    }).filter(Boolean))];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  }, [fiscalBooks]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading fiscal books...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Livros Fiscais
        </Typography>
        {allowCreate && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
          >
            Novo Livro Fiscal
          </Button>
        )}
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {/* Search */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Buscar livros fiscais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="Aberto">Aberto</MenuItem>
                <MenuItem value="Fechado">Fechado</MenuItem>
                <MenuItem value="Em Revisão">Em Revisão</MenuItem>
                <MenuItem value="Arquivado">Arquivado</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Year Filter */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ano</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                label="Ano"
              >
                <MenuItem value="all">Todos os Anos</MenuItem>
                {availableYears.map(year => (
                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Sort By */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="bookPeriod">Período</MenuItem>
                <MenuItem value="bookName">Nome</MenuItem>
                <MenuItem value="createdAt">Data de Criação</MenuItem>
                <MenuItem value="updatedAt">Data de Atualização</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Ordem</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Ordem"
              >
                <MenuItem value="desc">Decrescente</MenuItem>
                <MenuItem value="asc">Crescente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Fiscal Books Grid */}
      {filteredAndSortedBooks.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum livro fiscal encontrado
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {fiscalBooks.length === 0 
              ? 'Crie seu primeiro livro fiscal para começar'
              : 'Tente ajustar seus critérios de busca ou filtro'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredAndSortedBooks.map((book) => (
            <Grid item xs={12} sm={6} md={4} key={book._id || book.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                  }
                }}
                onClick={() => handleView(book)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" noWrap>
                      {book.bookName || book.name}
                    </Typography>
                    <Chip
                      label={getStatusChipLabel(book.status)}
                      color={getStatusChipColor(book.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Período: {book.bookPeriod || book.year}
                  </Typography>

                  {book.bookType && (
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tipo: {book.bookType}
                    </Typography>
                  )}

                  {(book.notes || book.description) && (
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {book.notes || book.description}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Transações: {book.transactionCount || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Criado: {book.createdAtFormatted || (book.createdAt ? new Date(book.createdAt).toLocaleDateString('pt-BR') : 'N/A')}
                    </Typography>
                    {(book.closedAtFormatted || book.closedAt) && (
                      <Typography variant="body2" color="warning.main">
                        Fechado: {book.closedAtFormatted || new Date(book.closedAt).toLocaleDateString('pt-BR')}
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <CardActions>
                  <Button size="small" onClick={(e) => {
                    e.stopPropagation();
                    handleView(book);
                  }}>
                    Ver
                  </Button>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, book);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleViewTransactions(selectedBook)}>
          <InfoIcon sx={{ mr: 1 }} />
          Ver Transações
        </MenuItem>
        <MenuItem onClick={() => handleViewStatistics(selectedBook)}>
          <StatsIcon sx={{ mr: 1 }} />
          Ver Estatísticas
        </MenuItem>
        {allowEdit && selectedBook && isFiscalBookEditable(selectedBook) && (
          <MenuItem onClick={() => handleEdit(selectedBook)}>
            <EditIcon sx={{ mr: 1 }} />
            Editar
          </MenuItem>
        )}
        <MenuItem onClick={handleExport}>
          <ExportIcon sx={{ mr: 1 }} />
          Exportar
        </MenuItem>
        <MenuItem onClick={handleToggleArchive}>
          {selectedBook?.status === 'Fechado' ? (
            <>
              <UnarchiveIcon sx={{ mr: 1 }} />
              Reabrir
            </>
          ) : (
            <>
              <ArchiveIcon sx={{ mr: 1 }} />
              Fechar
            </>
          )}
        </MenuItem>
        {allowDelete && selectedBook?.transactionCount === 0 && (
          <MenuItem onClick={handleDeleteConfirm} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Excluir
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Excluir Livro Fiscal</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza de que deseja excluir o livro fiscal "{bookToDelete?.bookName || bookToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleDelete}
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : null}
          >
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button for Mobile */}
      {allowCreate && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' },
          }}
          onClick={handleCreateNew}
        >
          <Tooltip title="Criar Novo Livro Fiscal">
            <AddIcon />
          </Tooltip>
        </Fab>
      )}

      {/* Fiscal Book Details Drawer */}
      <FiscalBookDrawer
        open={drawerOpen}
        onClose={handleDrawerClose}
        fiscalBook={drawerFiscalBook}
        onEdit={handleDrawerEdit}
        onRefresh={loadFiscalBooks}
        initialTab={drawerInitialTab}
      />
    </Box>
  );
}

FiscalBooksList.propTypes = {
  onCreateNew: PropTypes.func,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  allowCreate: PropTypes.bool,
  allowEdit: PropTypes.bool,
  allowDelete: PropTypes.bool,
};

FiscalBooksList.defaultProps = {
  onCreateNew: null,
  onEdit: null,
  onView: null,
  allowCreate: true,
  allowEdit: true,
  allowDelete: true,
};

export default FiscalBooksList;
