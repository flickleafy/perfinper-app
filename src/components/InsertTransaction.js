import React, { useState } from 'react';
import { transactionBuilder } from '../helpers/objectsBuilder.js';
import TransactionsDataService from '../services/TransactionsService.js';
// import { RadioGroup } from 'react-materialize';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const InsertTransaction = () => {
  const initialTransactionState = {
    _id: null,
    category: '',
    description: '',
    type: '',
    value: '',
    day: '',
    month: '',
    year: '',
    yearMonth: '',
    yearMonthDay: '',
  };
  const [transaction, setTransaction] = useState(initialTransactionState);
  const [submitted, setSubmitted] = useState(false);

  const [startDate, setStartDate] = useState(''); // datepicker
  const [transactionType, setTransactionType] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTransaction({ ...transaction, [name]: value });
  };

  const insertTransaction = () => {
    transaction.type = transactionType;
    let transactionData = transactionBuilder(transaction, startDate);
    if (transactionData) {
      TransactionsDataService.insertTransaction(transactionData)
        .then((response) => {
          // ????????? insert local storage too ?????????????
          setTransaction(response.data);
          setSubmitted(true);
          console.log(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  const newTransaction = () => {
    setTransaction(initialTransactionState);
    setSubmitted(false);
  };
  const handleTypeChange = (event) => {
    setTransactionType(event.target.value);
  };

  return (
    <div>
      {submitted ? (
        <div>
          <h4>O lançamento foi inserido com sucesso!</h4>
          <button
            className='btn btn-success'
            onClick={newTransaction}>
            Inserir Outro
          </button>
        </div>
      ) : (
        <div className='row'>
          <div className='col s12'>
            <h4>Inserir Lançamento</h4>
            <div className='form-group'>
              <label htmlFor='name'>Categoria</label>
              <input
                type='text'
                className='form-control'
                id='category'
                name='category'
                required
                value={transaction.category}
                onChange={handleInputChange}
              />
            </div>

            <div className='form-group'>
              <label htmlFor='subject'>Descrição</label>
              <input
                type='text'
                className='form-control'
                id='description'
                name='description'
                required
                value={transaction.description}
                onChange={handleInputChange}
              />
            </div>
            {/* - */}
            <RadioGroup
              label='Tipo'
              onChange={handleTypeChange}
              value={transactionType}
              radioClassNames='typeRadio'
              options={[
                {
                  label: 'Despesa',
                  value: '-',
                },
                {
                  label: 'Receita',
                  value: '+',
                },
              ]}
            />
            {/* - */}
            <div className='form-group'>
              <label htmlFor='value'>Valor</label>
              <input
                type='Number'
                className='form-control'
                id='value'
                name='value'
                required
                value={transaction.value}
                onChange={handleInputChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='date'>Data</label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>
            <div className='footerbuttongroup'>
              <button
                onClick={insertTransaction}
                className='waves-effect waves-light btn teal darken-1'>
                Inserir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsertTransaction;
