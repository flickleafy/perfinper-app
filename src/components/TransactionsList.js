import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//Data load and processing
import localStorage from 'local-storage';
import TransactionsDataService from '../services/TransactionsService.js';
import { checkSingleDigit } from '../helpers/objectsBuilder.js';
import { searchCategory, getIndexOfElement } from '../helpers/searchers.js';
//List Elements
import SearchBar from './SearchBar.js';
import StatusBar from './StatusBar.js';
import PeriodSelector from './PeriodSelector.js';
import LoadingIndicator from './LoadingIndicator.js';
import {
  transactionTypeColor,
  transactionTypeColorIcon,
  iconByCategory,
} from '../helpers/designHelpers.js';

import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Grid,
  Button,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';

const TransactionList = () => {
  const [fullTransactionsList, setFullTransactionsList] = useState([]);
  const [transactionsPrintList, setTransactionsPrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');

  useEffect(() => {
    if (!initializeFromLocalStorage()) {
      retrieveAllTransactions(periodSelected);
    }
  }, [periodSelected]);

  const retrieveAllTransactions = (period) => {
    TransactionsDataService.findAllTransactionsInPeriod(period)
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
    TransactionsDataService.deleteTransactionById(_id)
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
    TransactionsDataService.removeAllTransactionsInPeriod()
      .then((response) => {
        console.log(response.data);
        refreshList();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const deleteAllTransactionsByName = () => {
    TransactionsDataService.removeAllByNameDEPRECATED(searchTerm)
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
    <>
      <PeriodSelector
        currentPeriod={periodSelected}
        onDataChange={handleDataChangePeriodSelector}
      />
      <StatusBar array={transactionsPrintList} />
      <SearchBar
        array={fullTransactionsList}
        onDataChange={handleDataChangeSearchBar}
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
            {transactionsPrintList.map((transaction, index) => (
              <ListItem
                key={index}
                divider
                style={{
                  backgroundColor: transactionTypeColor(transaction.type),
                }}>
                <ListItemText
                  primary={`${checkSingleDigit(
                    transaction.day
                  )}/${checkSingleDigit(transaction.month)}`}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
                <ListItemIcon>
                  <IconButton
                    component={Link}
                    to='/'
                    onClick={() =>
                      handleCategorySelection(transaction.category)
                    }>
                    <span
                      className={transactionTypeColorIcon(transaction.type)}>
                      {iconByCategory(transaction.category)}
                    </span>
                  </IconButton>
                </ListItemIcon>
                <ListItemText
                  primary={`${transaction.category} - ${transaction.description}`}
                  secondary={`R$${transaction.value}`}
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
      <Grid
        container
        justifyContent='center'
        spacing={2}>
        <Button
          variant='contained'
          color='error'
          onClick={deleteAllTransactions}>
          Deletar Itens Listados
        </Button>
        <Button
          variant='contained'
          color='primary'
          onClick={restoreToFullTransactionsList}>
          Voltar Para Lista
        </Button>
      </Grid>
    </>
  );
};

export default TransactionList;
