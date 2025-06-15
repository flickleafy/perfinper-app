import React, { useState } from 'react';
import { personBuilder } from '../objectsBuilder.js';
import { insertPerson } from '../../services/personService.js';

// MUI Components
import { Button, Typography, Box } from '@mui/material';
import { personPrototype } from '../entityPrototypes.js';
import PersonForm from '../PersonForm.js';

const InsertPerson = () => {
  const initialPersonState = personPrototype();

  const [person, setPerson] = useState(initialPersonState);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setPerson(prevPerson => ({
        ...prevPerson,
        [parentKey]: {
          ...prevPerson[parentKey],
          [childKey]: value
        }
      }));
    } else {
      setPerson({ ...person, [name]: value });
    }
  };

  const handleDateChange = (name, date) => {
    setPerson({ ...person, [name]: date });
  };

  const handleContactsChange = (newContacts) => {
    setPerson(prevPerson => ({
      ...prevPerson,
      contacts: newContacts
    }));
  };

  const handlePersonalBusinessChange = (newBusiness) => {
    setPerson(prevPerson => ({
      ...prevPerson,
      personalBusiness: newBusiness
    }));
  };

  const insertPersonApi = () => {
    let personData = personBuilder(person);
    if (personData) {
      insertPerson(personData)
        .then((response) => {
          setPerson(response.data);
          setSubmitted(true);
          console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
          alert('Erro ao salvar pessoa. Verifique os dados e tente novamente.');
        });
    }
  };

  const newPerson = () => {
    setPerson(initialPersonState);
    setSubmitted(false);
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>
      {submitted ? (
        <Box>
          <Typography variant='h4'>
            A pessoa foi inserida com sucesso!
          </Typography>
          <Button
            variant='contained'
            color='success'
            onClick={newPerson}>
            Inserir Outra
          </Button>
        </Box>
      ) : (
        <>
          <PersonForm
            formTitle={'Inserir Pessoa'}
            person={person}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleContactsChange={handleContactsChange}
            handlePersonalBusinessChange={handlePersonalBusinessChange}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={insertPersonApi}>
              Salvar Pessoa
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={newPerson}>
              Limpar Formulário
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default InsertPerson;
