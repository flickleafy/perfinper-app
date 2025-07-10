import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { personBuilder } from '../objectsBuilder.js';
import { findPersonById, updatePersonById } from '../../services/personService.js';

// MUI Components
import { Button, Typography, Box } from '@mui/material';
import { personPrototype } from '../entityPrototypes.js';
import PersonForm from '../PersonForm.js';
import { useToast } from '../../ui/ToastProvider.js';

const EditPerson = () => {
  const { showToast } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const initialPersonState = personPrototype();

  const [person, setPerson] = useState(initialPersonState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      retrievePerson(id);
    }
  }, [id]);

  const retrievePerson = (id) => {
    findPersonById(id)
      .then((response) => {
        setPerson(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
        showToast('Erro ao carregar dados da pessoa', 'error');
      });
  };

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

  const updatePersonApi = () => {
    let personData = personBuilder(person);
    if (personData && id) {
      updatePersonById(id, personData)
        .then((response) => {
          setPerson(response.data);
          setSubmitted(true);
          console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
          showToast(
            'Erro ao atualizar pessoa. Verifique os dados e tente novamente.',
            'error'
          );
        });
    }
  };

  const goToPeopleList = () => {
    navigate('/pessoas');
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Carregando dados da pessoa...</Typography>
      </Box>
    );
  }

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>
      {submitted ? (
        <Box>
          <Typography variant='h4'>
            A pessoa foi atualizada com sucesso!
          </Typography>
          <Button
            variant='contained'
            color='success'
            onClick={goToPeopleList}>
            Voltar para Lista
          </Button>
        </Box>
      ) : (
        <>
          <PersonForm
            formTitle={'Editar Pessoa'}
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
              onClick={updatePersonApi}>
              Atualizar Pessoa
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={goToPeopleList}>
              Cancelar
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditPerson;
