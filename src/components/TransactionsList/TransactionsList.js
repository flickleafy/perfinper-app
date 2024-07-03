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
  useTheme,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
//Data load and processing
import localStorage from 'local-storage';
import {
  findAllTransactionsInPeriod,
  deleteTransactionById,
  removeAllTransactionsInPeriod,
  removeAllByNameDEPRECATED,
} from '../../services/transactionService.js';
import { getCategories } from '../../services/categoryService.js';

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

const TransactionList = () => {
  const theme = useTheme();
  const [fullTransactionsList, setFullTransactionsList] = useState([]);
  const [transactionsPrintList, setTransactionsPrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getCategories();
      setCategories(data.data);
    };

    fetchCategories();
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
    if (newSearchTerm.length >= 3) {
      setTransactionsPrintList(newList);
      localStorage.set('transactionsPrintList', newList);
    } else if (newSearchTerm.length < 3) {
      setTransactionsPrintList(fullTransactionsList);
      localStorage.set('transactionsPrintList', fullTransactionsList);
    }
  };

  const handleCategorySelection = (category) => {
    if (category.length > 0) {
      let searchList = searchCategory(category, fullTransactionsList);
      if (searchList.length > 0) {
        setTransactionsPrintList(searchList);
        localStorage.set('transactionsPrintList', searchList);
      }
    }
  };

  const restoreToFullTransactionsList = () => {
    setTransactionsPrintList(fullTransactionsList);
    localStorage.set('transactionsPrintList', fullTransactionsList);
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

  const categoryIdToName = (cateogryId) => {
    if (cateogryId && categories.length) {
      const selectedCategory = categories.filter(
        (category) => category.id === cateogryId
      )[0];
      return selectedCategory.name;
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
      paddingBottom={8}>
      <TransactionsListToolBar
        periodSelected={periodSelected}
        handleDataChangePeriodSelector={handleDataChangePeriodSelector}
        fullTransactionsList={fullTransactionsList}
        handleDataChangeSearchBar={handleDataChangeSearchBar}
        transactionsPrintList={transactionsPrintList}
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
                      category={transaction.transactionCategory}
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
                    secondary={
                      <div>
                        <div>{transaction.transactionDescription}</div>
                        {transaction.companyCnpj && (
                          <>
                            <div style={{ marginTop: '8px' }}>
                              Cnpj: {transaction.companyCnpj}
                            </div>
                            <div>Nome: {transaction.companyName}</div>
                          </>
                        )}
                      </div>
                    }
                    primaryTypographyProps={{ variant: 'h6' }}
                  />
                  <ListItemText
                    sx={{ flexGrow: 0, paddingRight: 2, minWidth: 140 }}
                    primary={`R$ ${transaction.transactionValue}`}
                    primaryTypographyProps={{ variant: 'h6' }}
                  />
                  <ListItemIcon>
                    <IconButton
                      component={Link}
                      to={`/editar/${transaction.id}`}>
                      <Edit color='primary' />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        handleDeleteSingleTransaction(transaction.id)
                      }>
                      <Delete color='error' />
                    </IconButton>
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
