import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
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
} from '../services/transactionService.js';
import { checkSingleDigit } from '../helpers/objectsBuilder.js';
import { searchCategory, getIndexOfElement } from '../helpers/searchers.js';
//List Elements
import LoadingIndicator from './LoadingIndicator.js';
import { transactionTypeColor } from '../helpers/useTransactionTypeColor.hook.jsx';
import { IconByCategory } from './Buttons/IconByCategory.jsx';
import { TransactionsListFooter } from './TransactionsListFooter.js';
import { TransactionsListHeader } from './TransactionsListHeader.js';

const TransactionList = () => {
  const theme = useTheme();
  const [fullTransactionsList, setFullTransactionsList] = useState([]);
  const [transactionsPrintList, setTransactionsPrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');

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

  const handleDeleteSingleTransaction = (_id) => {
    deleteTransactionById(_id)
      .then((response) => {
        // for each, achar pelo id, remover do vetor local
        removeElementFromList(
          _id,
          fullTransactionsList,
          setFullTransactionsList,
          'fullTransactionsList'
        );
        removeElementFromList(
          _id,
          transactionsPrintList,
          setTransactionsPrintList,
          'transactionsPrintList'
        );
      })
      .catch((e) => {
        console.log(e);
      });
  };

  function removeElementFromList(_id, elementList, setListCB, listName) {
    let index = getIndexOfElement(_id, elementList);
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

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}>
      <TransactionsListHeader
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
          {/*  */}
          <Typography
            variant='h4'
            align='center'>
            Lançamentos
          </Typography>
          {/*  */}
          <List>
            {transactionsPrintList?.map((transaction, index) => (
              <ListItem
                key={transaction._id}
                divider
                style={{
                  backgroundColor: transactionTypeColor(
                    transaction.type,
                    theme?.palette.primary.light,
                    theme?.palette.secondary.light
                  ),
                }}>
                <ListItemText
                  sx={{ flexGrow: 0, paddingRight: 2 }}
                  primary={`${checkSingleDigit(
                    transaction.day
                  )}/${checkSingleDigit(transaction.month)}`}
                  primaryTypographyProps={{ variant: 'h5' }}
                />
                <ListItemIcon>
                  <IconByCategory
                    category={transaction.category}
                    type={transaction.type}
                    destination='/'
                    onClick={() =>
                      handleCategorySelection(transaction.category)
                    }
                  />
                </ListItemIcon>
                <ListItemText
                  primary={`${transaction.category}`}
                  secondary={`${transaction.description}`}
                  primaryTypographyProps={{ variant: 'h6' }}
                />
                <ListItemText
                  sx={{ flexGrow: 0, paddingRight: 2 }}
                  primary={`R$ ${transaction.value}`}
                  primaryTypographyProps={{ variant: 'h6' }}
                />
                <ListItemIcon>
                  <IconButton
                    component={Link}
                    to={`/editar/${transaction._id}`}>
                    <Edit color='primary' />
                  </IconButton>
                  <IconButton
                    onClick={() =>
                      handleDeleteSingleTransaction(transaction._id)
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
