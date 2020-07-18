import React, { useState, useEffect } from 'react';

const StatusBar = ({ array }) => {
  const [totalExpense, setTotalExpense] = useState('');
  const [totalRevenue, setTotalRevenue] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    let revenue = array.filter((element) => {
      if (element.type === '+') {
        return element;
      }
    });
    let expense = array.filter((element) => {
      if (element.type === '-') {
        return element;
      }
    });
    revenue = setTotal(revenue, setTotalRevenue);
    expense = setTotal(expense, setTotalExpense);
    getBalance(revenue, expense);
  }, [array]);
  /*const onChangeSearchTransaction = (searchName) => {
    let transactionsSearchList = [];

    transactionsSearchList = array.filter(
      (element) => element.description.toLowerCase().indexOf(searchName) !== -1
    );
    if (transactionsSearchList.length > 0) {
      onDataChange(searchName, transactionsSearchList);
    }
  };*/
  // const getTotalTransactions = (arr) => {
  //   if (arr.length > 0) {
  //     return arr.length;
  //   }
  //   return 0;
  // };

  const setTotal = (arr, set) => {
    let total = 0;
    arr.forEach((element) => {
      total = total + element.value;
    });
    set(total);
    return total;
  };

  const getBalance = (revenue, expense) => {
    setBalance(revenue - expense);
  };

  return (
    <div className="row">
      <div className="col s6 m3">
        <span>Lançamentos: </span>
        {array.length}
      </div>
      <div className="col s6 m3">
        <span>Receita: </span>
        R${totalRevenue}
      </div>
      <div className="col s6 m3">
        <span>Despesa: </span>
        R${totalExpense}
      </div>
      <div className="col s6 m3">
        <span>Saldo: </span>
        R${balance}
      </div>
    </div>
  );
};

export default StatusBar;
