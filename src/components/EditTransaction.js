import React, { useState, useEffect } from 'react';
import TransactionsDataService from '../services/TransactionsService.js';
// import { RadioGroup } from 'react-materialize';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { buildDateObj, transactionBuilder } from '../helpers/objectsBuilder.js';
import { searchByID, getIndexOfElement } from '../helpers/searchers.js';
import localStorage from 'local-storage';

const EditTransaction = (props) => {
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
  const [currentTransaction, setCurrentTransaction] = useState(
    initialTransactionState
  );
  const [message, setMessage] = useState('');
  const [transactionDate, setTransactionDate] = useState(''); // datepicker
  const [transactionType, setTransactionType] = useState('');

  useEffect(() => {
    if (!initializeFromLocalStorage()) {
      getTransaction(props.match.params.id);
    }
  }, [props.match.params.id]);

  const getTransaction = (id) => {
    TransactionsDataService.findTransactionById(id)
      .then((response) => {
        setCurrentTransaction(response.data);
        setTransactionDate(buildDateObj(response.data));
        setTransactionType(response.data.type);
        console.log(response.data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const initializeFromLocalStorage = () => {
    let tmpFTL = localStorage.get('fullTransactionsList');

    if (tmpFTL) {
      let tmpTrans = searchByID(props.match.params.id, tmpFTL);
      setCurrentTransaction(tmpTrans);
      setTransactionDate(buildDateObj(tmpTrans));
      setTransactionType(tmpTrans.type);
      return true;
    } else {
      return null;
    }
  };

  const storeToLocalStorage = (updatedTransaction) => {
    let tmpFTL = localStorage.get('fullTransactionsList');
    let tmpTPL = localStorage.get('transactionsPrintList');

    updatedTransaction._id = props.match.params.id;
    if (tmpFTL && tmpTPL) {
      let indexFTL = getIndexOfElement(props.match.params.id, tmpFTL);
      let indexTPL = getIndexOfElement(props.match.params.id, tmpTPL);

      tmpFTL[indexFTL] = updatedTransaction;
      if (indexTPL > -1) {
        tmpTPL[indexTPL] = updatedTransaction;
      }

      localStorage.set('fullTransactionsList', tmpFTL);
      localStorage.set('transactionsPrintList', tmpTPL);
      return true;
    } else {
      return null;
    }
  };

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    if (name === 'value') {
      value = parseInt(value);
    }
    setCurrentTransaction({ ...currentTransaction, [name]: value });
  };

  const updateTransaction = () => {
    let updatedTransaction = transactionBuilder(
      currentTransaction,
      transactionDate
    );
    TransactionsDataService.updateTransactionById(
      currentTransaction._id,
      updatedTransaction
    )
      .then((response) => {
        storeToLocalStorage(updatedTransaction);
        setMessage('O lançamento foi atualizado com sucesso!');
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // const ExampleCustomInput = ({ value, onClick }) => (
  //   <button className="example-custom-input" onClick={onClick}>
  //     {value}
  //   </button>
  // );

  const handleTypeChange = (event) => {
    setTransactionType(event.target.value);
  };

  return (
    <div>
      <div className='row'>
        <div className='col s12'>
          <h4>Editar Lançamento</h4>
          <form action='#'>
            <div className='form-group'>
              <label htmlFor='name'>Categoria</label>
              <input
                type='text'
                className='form-control'
                id='category'
                name='category'
                value={currentTransaction.category}
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
                value={currentTransaction.description}
                onChange={handleInputChange}
              />
            </div>
            {/* - */}
            <RadioGroup
              label='Tipo'
              onChange={handleTypeChange}
              value={transactionType}
              radioClassNames='typeRadio'
              disabled
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
                type='number'
                className='form-control'
                id='value'
                name='value'
                value={currentTransaction.value}
                onChange={handleInputChange}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='date'>Data</label>
              <DatePicker
                selected={transactionDate}
                onChange={(date) => setTransactionDate(date)}
              />
            </div>
          </form>

          <div className='footerbuttongroup'>
            <button className='waves-effect waves-light btn red darken-4'>
              Deletar
            </button>

            <button
              type='submit'
              className='waves-effect waves-light btn teal darken-1'
              onClick={updateTransaction}>
              Atualizar
            </button>
          </div>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default EditTransaction;
