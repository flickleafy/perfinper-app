import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Grid,
  Box,
  Typography,
  useTheme,
  Chip,
} from '@mui/material';
import { Edit, Delete, MenuBook } from '@mui/icons-material';
//Data load and processing
import localStorage from 'local-storage';
import {
  findAllTransactionsInPeriod,
  deleteTransactionById,
  removeAllTransactionsInPeriod,
  removeAllByNameDEPRECATED,
} from '../../services/transactionService.js';
import { getCategories } from '../../services/categoryService.js';
import fiscalBookService from '../../services/fiscalBookService.js';

import {
  searchCategory,
  getIndexOfElement,
} from '../../infrastructure/searcher/searchers.js';
//List Elements
import LoadingIndicator from '../../ui/LoadingIndicator.js';
import { IconByCategory } from '../../ui/Buttons/IconByCategory';
import { transactionTypeColor } from '../../ui/Buttons/useTransactionTypeColor.hook';
import { TransactionsListFooter } from './TransactionsListFooter.js';
import { TransactionsListToolBar } from './TransactionsListToolBar.js';
import { TransactionsListHeader } from './TransactionsListHeader.js';
import { formatDate } from '../../infrastructure/date/formatDate.js';
import TransactionFiscalBookActions from '../TransactionFiscalBookActions/TransactionFiscalBookActions.js';

const TransactionList = () => {
  const theme = useTheme();
  const [fullTransactionsList, setFullTransactionsList] = useState([]);
  const [transactionsPrintList, setTransactionsPrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');  const [periodSelected, setPeriodSelected] = useState('');
  const [categories, setCategories] = useState([]);
  const [fiscalBooks, setFiscalBooks] = useState([]);
  const [selectedFiscalBookId, setSelectedFiscalBookId] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };

    const fetchFiscalBooks = async () => {
      try {
        const books = await fiscalBookService.getAll();
        setFiscalBooks(books || []);
      } catch (error) {
        console.error('Error fetching fiscal books:', error);
        setFiscalBooks([]);
      }
    };

    fetchCategories();
    fetchFiscalBooks();
  }, []);

  useEffect(() => {
    if (!initializeFromLocalStorage()) {
      retrieveAllTransactions(periodSelected);
    }
  }, [periodSelected]);

  /**
   * Retrieves all transactions for a specified period and updates both the full and printable lists of transactions.
   * The function fetches data asynchronously from the TransactionsDataService and handles the response or errors accordingly.
   * If transactions are found, they are saved to both local component state and localStorage.
   *
   * @param {string} period - The period for which to retrieve transactions.
   */
  const retrieveAllTransactions = (period) => {
    console.log('period retrieve all trans', period);
    if (period) {
      findAllTransactionsInPeriod(period)
        .then((response) => {
          setFullTransactionsList(response.data);
          setTransactionsPrintList(response.data);
          localStorage.set('fullTransactionsList', response.data);
          localStorage.set('transactionsPrintList', response.data);
          console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const initializeFromLocalStorage = () => {
    let tmpFTL = localStorage.get('fullTransactionsList');
    let tmpTPL = localStorage.get('transactionsPrintList');
    let tmpST = localStorage.get('searchTerm');
    let tmpPS = localStorage.get('periodSelected');

    if (tmpFTL && tmpTPL && tmpPS) {
      setFullTransactionsList(tmpFTL);
      setTransactionsPrintList(tmpTPL);
      setSearchTerm(tmpST);
      setPeriodSelected(tmpPS);
      return true;
    }
    return false;
  };

  const refreshList = () => {
    retrieveAllTransactions(periodSelected);
  };

  const handleDeleteSingleTransaction = (id) => {
    deleteTransactionById(id)
      .then((response) => {
        // for each, achar pelo id, remover do vetor local
        removeElementFromList(
          id,
          fullTransactionsList,
          setFullTransactionsList,
          'fullTransactionsList'
        );
        removeElementFromList(
          id,
          transactionsPrintList,
          setTransactionsPrintList,
          'transactionsPrintList'
        );
      })
      .catch((e) => {
        console.log(e);
      });
  };

  function removeElementFromList(id, elementList, setListCB, listName) {
    let index = getIndexOfElement(id, elementList);
    elementList.splice(index, 1); // remove the object by index
    let modifiedElementList = [...elementList];
    setListCB(modifiedElementList);
    localStorage.set(listName, modifiedElementList);
  }

  const deleteAllTransactions = () => {
    if (searchTerm) {
      deleteAllTransactionsByName();
    } else {
      deleteAllTransactionsInPeriod();
    }
  };

  const deleteAllTransactionsInPeriod = () => {
    removeAllTransactionsInPeriod()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const deleteAllTransactionsByName = () => {
    removeAllByNameDEPRECATED(searchTerm)
      .then((response) => {
        console.log(response.data);
        refreshList();
        setSearchTerm('');
        localStorage.set('searchTerm', '');
      })
      .catch((e) => {
        console.log(e);
      });
  };
  const handleDataChangeSearchBar = (newSearchTerm, newList) => {
    setSearchTerm(newSearchTerm);
    localStorage.set('searchTerm', newSearchTerm);
    
    let filteredList;
    if (newSearchTerm.length >= 3) {
      filteredList = newList;
    } else if (newSearchTerm.length < 3) {
      filteredList = fullTransactionsList;
    }
    
    // Apply fiscal book filter to the search results
    applyFiscalBookFilter(selectedFiscalBookId, filteredList);
  };
  const handleCategorySelection = (category) => {
    if (category.length > 0) {
      let searchList = searchCategory(category, fullTransactionsList);
      if (searchList.length > 0) {
        // Apply fiscal book filter to category results
        applyFiscalBookFilter(selectedFiscalBookId, searchList);
      }
    }
  };

  const restoreToFullTransactionsList = () => {    // Apply fiscal book filter to full list
    applyFiscalBookFilter(selectedFiscalBookId, fullTransactionsList);
  };

  const handleTransactionUpdated = (updatedTransaction) => {
    // Update the transaction in both lists
    const updateTransactionInList = (list, setList, storageKey) => {
      const updatedList = list.map(t => 
        t.id === updatedTransaction.id ? updatedTransaction : t
      );
      setList(updatedList);
      localStorage.set(storageKey, updatedList);
    };

    updateTransactionInList(fullTransactionsList, setFullTransactionsList, 'fullTransactionsList');
    updateTransactionInList(transactionsPrintList, setTransactionsPrintList, 'transactionsPrintList');
  };

  const handleMenuOpen = (event, transaction) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedTransaction(transaction);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedTransaction(null);
  };
  const handleDataChangePeriodSelector = (period) => {
    if (period.length > 0) {
      //Blast current transactions list
      setTransactionsPrintList([]);
      setPeriodSelected(period);
      localStorage.set('periodSelected', period);
      retrieveAllTransactions(period);
    }
  };

  const handleFiscalBookChange = (fiscalBookId) => {
    setSelectedFiscalBookId(fiscalBookId);
    applyFiscalBookFilter(fiscalBookId, fullTransactionsList);
  };

  const applyFiscalBookFilter = (fiscalBookId, transactions) => {
    let filteredTransactions = transactions;

    if (fiscalBookId === 'none') {
      // Show only transactions without fiscal book
      filteredTransactions = transactions.filter(t => !t.fiscalBookId);
    } else if (fiscalBookId && fiscalBookId !== 'all') {
      // Show only transactions with the selected fiscal book
      filteredTransactions = transactions.filter(t => t.fiscalBookId === fiscalBookId);
    }
    // If fiscalBookId is null or 'all', show all transactions

    setTransactionsPrintList(filteredTransactions);
    localStorage.set('transactionsPrintList', filteredTransactions);
  };

  /**
   * Get the year from the selected fiscal book
   */
  const selectedFiscalBookYear = React.useMemo(() => {
    if (!selectedFiscalBookId || selectedFiscalBookId === 'all' || selectedFiscalBookId === 'none') {
      return null;
    }
    const book = fiscalBooks.find(b => (b._id || b.id) === selectedFiscalBookId);
    if (book) {
      const period = book.bookPeriod || book.year?.toString() || '';
      // Extract year from period (e.g., '2023' from '2023' or '2023-01' from '2023-01')
      return period.includes('-') ? period.split('-')[0] : period;
    }
    return null;
  }, [selectedFiscalBookId, fiscalBooks]);
  const categoryIdToName = (cateogryId) => {
    if (cateogryId && categories.length) {
      const selectedCategory = categories.find(
        (category) => category.id === cateogryId
      );
      return selectedCategory ? selectedCategory.name : 'Unknown code';
    }
  };
  /**
   * Create a memoized map of fiscal books for better performance
   */
  const fiscalBookMap = React.useMemo(() => {
    const map = new Map();
    fiscalBooks.forEach(book => {
      const id = book._id || book.id;
      if (id) {
        map.set(id, {
          name: book.bookName || book.name || 'Desconhecido',
          period: (() => {
            const period = book.bookPeriod || book.year?.toString() || '';
            return period.includes('-') ? period.split('-')[0] : period || 'N/A';
          })()
        });
      }
    });
    return map;
  }, [fiscalBooks]);
  /**
   * Get fiscal book details by ID using the memoized map
   * @param {string} fiscalBookId - The fiscal book ID
   * @returns {Object} Fiscal book details
   */
  const getFiscalBookDetails = (fiscalBookId) => {
    if (!fiscalBookId) return { name: 'Desconhecido', period: 'N/A' };
    return fiscalBookMap.get(fiscalBookId) || { name: 'Desconhecido', period: 'N/A' };
  };

  /**
   * Render fiscal book chip component
   * @param {string} fiscalBookId - The fiscal book ID
   * @returns {JSX.Element} Fiscal book chip
   */
  const renderFiscalBookChip = (fiscalBookId) => {
    if (fiscalBookId) {
      const fiscalBookDetails = getFiscalBookDetails(fiscalBookId);
      return (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBook fontSize="small" color="action" />
          <Chip
            label={`Livro Fiscal: ${fiscalBookDetails.name} (${fiscalBookDetails.period})`}
            size="small"
            variant="outlined"
            color="primary"
          />
        </Box>
      );
    } else {
      return (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <MenuBook fontSize="small" color="disabled" />
          <Chip
            label="Sem livro fiscal"
            size="small"
            variant="outlined"
            color="default"
          />
        </Box>
      );
    }
  };

  /**
   * Sorts data based on the given column and order. Includes type handling for numerical values.
   *
   * @param {string} column - The column identifier to sort by.
   * @param {string} order - The order ('asc' or 'desc') to sort by.
   * @param {boolean} isNumeric - Indicates if the sorting should be done numerically.
   */
  const sortData = (column, order, isNumeric = false) => {
    const sortedData = [...transactionsPrintList].sort((a, b) => {
      let first = a[column];
      let second = b[column];

      // Parse values as numbers if the column data is numeric.
      if (isNumeric) {
        first = parseFloat(first);
        second = parseFloat(second);
      }

      if (first < second) {
        return order === 'asc' ? -1 : 1;
      }
      if (first > second) {
        return order === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setTransactionsPrintList(sortedData);
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>      <TransactionsListToolBar
        periodSelected={periodSelected}
        handleDataChangePeriodSelector={handleDataChangePeriodSelector}
        fullTransactionsList={fullTransactionsList}
        handleDataChangeSearchBar={handleDataChangeSearchBar}
        transactionsPrintList={transactionsPrintList}
        selectedFiscalBookId={selectedFiscalBookId}
        onFiscalBookChange={handleFiscalBookChange}
        fiscalBookYear={selectedFiscalBookYear}
      />
      <Grid
        container
        spacing={2}
        sx={{ mt: 2 }}>
        <Grid
          item
          xs={12}>
          <TransactionsListHeader onSortChange={sortData} />
          <List
            sx={{
              paddingTop: 0,
            }}>
            {categories.length > 0 &&
              transactionsPrintList?.map((transaction) => (
                <ListItem
                  key={transaction.id}
                  divider
                  sx={{
                    backgroundColor: transactionTypeColor(
                      transaction.transactionType,
                      theme?.palette.primary.light,
                      theme?.palette.secondary.light
                    ),
                  }}>
                  <ListItemText
                    sx={{ flexGrow: 0, minWidth: 64 }}
                    primary={`${formatDate(transaction.transactionDate)}`}
                    primaryTypographyProps={{ variant: 'h5' }}
                  />
                  <ListItemIcon sx={{ paddingLeft: 6, paddingRight: 6 }}>
                    <IconByCategory
                      category={categoryIdToName(
                        transaction.transactionCategory
                      )}
                      type={transaction.transactionType}
                      destination='/'
                      onClick={() =>
                        handleCategorySelection(transaction.transactionCategory)
                      }
                    />
                  </ListItemIcon>
                  <ListItemText
                    sx={{ paddingRight: 4 }}
                    primary={`${categoryIdToName(
                      transaction.transactionCategory
                    )}`}
                    secondaryTypographyProps={{ component: 'div' }}
                    secondary={
                      <Box>
                        <Typography variant="body2">{transaction.transactionDescription}</Typography>
                        {transaction.companyCnpj && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              Cnpj: {transaction.companyCnpj}
                            </Typography>
                            <Typography variant="body2">Nome: {transaction.companyName}</Typography>
                          </Box>
                        )}                        {/* Fiscal Book Information */}
                        {renderFiscalBookChip(transaction.fiscalBookId)}
                      </Box>
                    }
                    primaryTypographyProps={{ variant: 'h6' }}
                  />
                  <ListItemText
                    sx={{ flexGrow: 0, paddingRight: 2, minWidth: 140 }}
                    primary={`R$ ${transaction.transactionValue}`}
                    primaryTypographyProps={{ variant: 'h6' }}
                  />                  <ListItemIcon>
                    <IconButton
                      component={Link}
                      data-testid="edit-btn"
                      to={`/editar/${transaction.id}`}>
                      <Edit color='primary' />
                    </IconButton>
                    <IconButton
                      data-testid="delete-btn"
                      onClick={() =>
                        handleDeleteSingleTransaction(transaction.id)
                      }>
                      <Delete color='error' />
                    </IconButton>
                    <TransactionFiscalBookActions
                      transaction={transaction}
                      onTransactionUpdated={handleTransactionUpdated}
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl && selectedTransaction?.id === transaction.id)}
                      onClose={handleMenuClose}
                      onOpen={(event) => handleMenuOpen(event, transaction)}
                    />
                  </ListItemIcon>
                </ListItem>
              ))}
          </List>
          {/*  */}
        </Grid>
      </Grid>
      <LoadingIndicator />
      <TransactionsListFooter
        disabled={transactionsPrintList.length === 0}
        deleteAllTransactions={deleteAllTransactions}
        restoreToFullTransactionsList={restoreToFullTransactionsList}
      />
    </Box>
  );
};

export default TransactionList;
