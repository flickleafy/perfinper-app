import React, { useState, useEffect, Fragment } from 'react';
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
        console.log(e);
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
    } else {
      return null;
    }
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
    <Fragment>
      <PeriodSelector
        currentPeriod={periodSelected}
        onDataChange={handleDataChangePeriodSelector}
      />
      <StatusBar array={transactionsPrintList} />
      <SearchBar
        array={fullTransactionsList}
        onDataChange={handleDataChangeSearchBar}
      />

      <div className='row'>
        <div className='col s12'>
          <h4 className='center'>Lançamentos</h4>

          <ul className='collection'>
            {transactionsPrintList &&
              transactionsPrintList.map((transaction, index) => (
                <li
                  className={transactionTypeColor(transaction.type)}
                  // onClick={() => setActiveTransaction(transaction, index)}
                  key={index}>
                  <div className='col s1 m1 l1'>
                    <div className='datepad'>
                      <h5 className='date'>
                        {checkSingleDigit(transaction.day)}
                      </h5>
                      <h5 className='date bar'>/</h5>
                      <h5 className='date'>
                        {checkSingleDigit(transaction.month)}
                      </h5>
                    </div>
                  </div>
                  <div className='col s8 m10 l9'>
                    <div className='descriptioncontainer'>
                      <div className='iconcontainer'>
                        <div className='midgrid'>
                          <Link
                            to='/'
                            onClick={() =>
                              handleCategorySelection(transaction.category)
                            }>
                            <i
                              className={
                                'material-icons category circle ' +
                                transactionTypeColorIcon(transaction.type)
                              }>
                              {iconByCategory(transaction.category)}
                            </i>
                          </Link>
                        </div>
                      </div>

                      <h5 className='category'>{transaction.category}</h5>
                      <span className='description'>
                        {transaction.description}{' '}
                      </span>
                    </div>

                    <h5 className='value'>R${transaction.value}</h5>
                  </div>

                  <div className='col s2 m1 l2'>
                    <div className='actionsgroup'>
                      <Link
                        to={'/editar/' + transaction._id}
                        className=''>
                        <i
                          className={
                            'material-icons actions circle ' +
                            transactionTypeColorIcon(transaction.type)
                          }>
                          edit
                        </i>
                      </Link>
                      <Link
                        to='/'
                        onClick={() =>
                          handleDeleteSingleTransaction(transaction._id)
                        }>
                        <i
                          className={
                            'material-icons actions circle ' +
                            transactionTypeColorIcon(transaction.type)
                          }>
                          delete
                        </i>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
          <LoadingIndicator />
          <div className='footerbuttongroup'>
            <button
              className='waves-effect waves-light btn red darken-4'
              onClick={deleteAllTransactions}>
              Deletar Itens Listados
            </button>
            <button
              className='waves-effect waves-light btn teal darken-1'
              onClick={restoreToFullTransactionsList}>
              Voltar Para Lista
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default TransactionList;
