import React, { useState, useEffect, Fragment } from 'react';
import { Link } from 'react-router-dom';
//Data load and processing
import TransactionsDataService from '../services/TransactionsService';
import { checkSingleDigit } from '../helpers/objectsBuilder.js';
import { searchCategory } from '../helpers/searchers.js';
//List Elements
import SearchBar from './SearchBar';
import StatusBar from './StatusBar';
import PeriodSelector from './PeriodSelector';
import LoadingIndicator from './LoadingIndicator';

const TransactionList = () => {
  const [fullTransactionsList, setFullTransactionsList] = useState([]);
  const [transactionsPrintList, setTransactionsPrintList] = useState([]);
  //const [currentTransaction, setCurrentTransaction] = useState(null);
  //const [currentIndex, setCurrentIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [periodSelected, setPeriodSelected] = useState('');

  useEffect(() => {
    retrieveAllTransactions(periodSelected);
  }, [periodSelected]);

  const retrieveAllTransactions = (period) => {
    TransactionsDataService.findAllTransactionsInPeriod(period)
      .then((response) => {
        setFullTransactionsList(response.data);
        setTransactionsPrintList(response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const refreshList = () => {
    retrieveAllTransactions(periodSelected);
    //setCurrentTransaction(null);
    //setCurrentIndex(-1);
  };

  // const setActiveTransaction = (transaction, index) => {
  //   setCurrentTransaction(transaction);
  //   setCurrentIndex(index);
  // };

  const handleDeleteSingleTransaction = (_id) => {
    TransactionsDataService.deleteTransactionById(_id)
      .then((response) => {
        // for each, achar pelo id, remover do vetor local
        removeElementFromList(
          _id,
          fullTransactionsList,
          setFullTransactionsList
        );
        removeElementFromList(
          _id,
          transactionsPrintList,
          setTransactionsPrintList
        );
      })
      .catch((e) => {
        console.log(e);
      });
  };

  function removeElementFromList(_id, elementList, setCallback) {
    let index = elementList.findIndex((element) => {
      if (element._id === _id) {
        return element;
      }
    });
    elementList.splice(index, 1); // remove the object by index
    let tmpArr = [...elementList];
    setCallback(tmpArr);
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
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // prettier-ignore
  const transactionTypeColor = (type) => {
    if (type === '-') {return 'collection-item brown lighten-5 ';} 
    else {return 'collection-item green lighten-5 ';}
  };
  // prettier-ignore
  const transactionTypeColorIcon = (type) => {
    if (type === '-') {return 'brown lighten-3 ';} 
    else {return 'green lighten-3 ';}
  };
  // prettier-ignore
  const iconByCategory = (category) => {
    switch (category) {
      case 'Mercado': return 'local_grocery_store'; case 'Receita': return 'attach_money';
      case 'Transporte': return 'directions_car'; case 'Saúde': return 'local_hospital';
      case 'Lazer': return 'directions_bike'; default: break;
    }
  };

  const handleDataChangeSearchBar = (searchTermFromSearchBar, newList) => {
    setSearchTerm(searchTermFromSearchBar);
    if (searchTermFromSearchBar.length >= 3) {
      setTransactionsPrintList(newList);
    } else if (searchTermFromSearchBar.length < 3) {
      setTransactionsPrintList(fullTransactionsList);
    }
  };
  const handleCategorySelection = (category) => {
    if (category.length > 0) {
      let searchList = searchCategory(category, fullTransactionsList);
      if (searchList.length > 0) {
        //Blast current transactions list
        setTransactionsPrintList([]);
        setTransactionsPrintList(searchList);
      }
    }
  };

  const restoreToFullTransactionsList = () => {
    setTransactionsPrintList([]);
    setTransactionsPrintList(fullTransactionsList);
  };

  const handleDataChangePeriodSelector = (period) => {
    if (period.length > 0) {
      //Blast current transactions list
      setTransactionsPrintList([]);
      setPeriodSelected(period);
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

      <div className="row">
        <div className="col s12">
          <h4 className="center">Lançamentos</h4>

          <ul className="collection">
            {transactionsPrintList &&
              transactionsPrintList.map((transaction, index) => (
                <li
                  className={transactionTypeColor(transaction.type)}
                  // onClick={() => setActiveTransaction(transaction, index)}
                  key={index}
                >
                  <div className="col s1 m1 l1">
                    <div className="datepad">
                      <h5 className="date">
                        {checkSingleDigit(transaction.day)}
                      </h5>
                      <h5 className="date bar">/</h5>
                      <h5 className="date">
                        {checkSingleDigit(transaction.month)}
                      </h5>
                    </div>
                  </div>
                  <div className="col s8 m10 l9">
                    <div className="descriptioncontainer">
                      <div className="iconcontainer">
                        <div className="midgrid">
                          <Link
                            to="/"
                            onClick={() =>
                              handleCategorySelection(transaction.category)
                            }
                          >
                            <i
                              className={
                                'material-icons category circle ' +
                                transactionTypeColorIcon(transaction.type)
                              }
                            >
                              {iconByCategory(transaction.category)}
                            </i>
                          </Link>
                        </div>
                      </div>

                      <h5 className="category">{transaction.category}</h5>
                      <span className="description">
                        {transaction.description}{' '}
                      </span>
                    </div>

                    <h5 className="value">R${transaction.value}</h5>
                  </div>

                  <div className="col s2 m1 l2">
                    <div className="actionsgroup">
                      <Link to={'/editar/' + transaction._id} className="">
                        <i
                          className={
                            'material-icons actions circle ' +
                            transactionTypeColorIcon(transaction.type)
                          }
                        >
                          edit
                        </i>
                      </Link>
                      <Link
                        to="/"
                        onClick={() =>
                          handleDeleteSingleTransaction(transaction._id)
                        }
                      >
                        <i
                          className={
                            'material-icons actions circle ' +
                            transactionTypeColorIcon(transaction.type)
                          }
                        >
                          delete
                        </i>
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
          </ul>
          <LoadingIndicator />
          <div className="footerbuttongroup">
            <button
              className="waves-effect waves-light btn red darken-4"
              onClick={deleteAllTransactions}
            >
              Deletar Itens Listados
            </button>
            <button
              className="waves-effect waves-light btn teal darken-1"
              onClick={restoreToFullTransactionsList}
            >
              Voltar Para Lista
            </button>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default TransactionList;
