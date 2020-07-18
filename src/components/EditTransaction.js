import React, { useState, useEffect } from 'react';
import TransactionsDataService from '../services/TransactionsService';
import { RadioGroup } from 'react-materialize';

import { buildDateObj, transactionBuilder } from '../helpers/objectsBuilder.js';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

  useEffect(() => {
    getTransaction(props.match.params.id);
  }, [props.match.params.id]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
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
      <div className="row">
        <div className="col s12">
          <h4>Editar Lançamento</h4>
          <form action="#">
            <div className="form-group">
              <label htmlFor="name">Categoria</label>
              <input
                type="text"
                className="form-control"
                id="category"
                name="category"
                value={currentTransaction.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Descrição</label>
              <input
                type="text"
                className="form-control"
                id="description"
                name="description"
                value={currentTransaction.description}
                onChange={handleInputChange}
              />
            </div>
            {/* - */}
            {/* <div className="col s6">
              <label>
                <input
                  disabled
                  type="radio"
                  name="group1"
                  value="-"
                  checked={transactionType === '-'}
                  // onChange={handleTypeChange}
                  className=""
                />
                Despesa
              </label>
            </div>
            <div className="col s6">
              <label>
                <input
                  disabled
                  type="radio"
                  name="group1"
                  value="+"
                  checked={transactionType === '+'}
                  // onChange={handleTypeChange}
                  className=""
                />
                Receita
              </label>
            </div> */}
            <RadioGroup
              label="Tipo"
              onChange={handleTypeChange}
              value={transactionType}
              radioClassNames="typeRadio"
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

            <div className="form-group">
              <label htmlFor="value">Valor</label>
              <input
                type="number"
                className="form-control"
                id="value"
                name="value"
                value={currentTransaction.value}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="date">Data</label>
              <DatePicker
                selected={transactionDate}
                onChange={(date) => setTransactionDate(date)}
              />
            </div>
          </form>

          <div className="footerbuttongroup">
            <button className="waves-effect waves-light btn red darken-4">
              Deletar
            </button>

            <button
              type="submit"
              className="waves-effect waves-light btn teal darken-1"
              onClick={updateTransaction}
            >
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
