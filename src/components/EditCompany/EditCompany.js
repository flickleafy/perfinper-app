import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { companyBuilder } from '../objectsBuilder.js';
import { findCompanyById, updateCompanyById } from '../../services/companyService.js';

// MUI Components
import { Button, Typography, Box } from '@mui/material';
import { companyPrototype } from '../entityPrototypes.js';
import CompanyForm from '../CompanyForm.js';

const EditCompany = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialCompanyState = companyPrototype();

  const [company, setCompany] = useState(initialCompanyState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      retrieveCompany(id);
    }
  }, [id]);

  const retrieveCompany = (id) => {
    findCompanyById(id)
      .then((response) => {
        setCompany(response.data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
        alert('Erro ao carregar dados da empresa');
      });
  };

  const handleInputChange = (event) => {
    let { name, value } = event.target;
    
    // Handle nested object updates
    if (name.includes('.')) {
      const [parentKey, childKey] = name.split('.');
      setCompany(prevCompany => ({
        ...prevCompany,
        [parentKey]: {
          ...prevCompany[parentKey],
          [childKey]: value
        }
      }));
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  const handleDateChange = (name, date) => {
    setCompany({ ...company, [name]: date });
  };

  const handleContactsChange = (newContacts) => {
    setCompany(prevCompany => ({
      ...prevCompany,
      contacts: newContacts
    }));
  };

  const handleActivitiesChange = (newActivities) => {
    setCompany(prevCompany => ({
      ...prevCompany,
      activities: newActivities
    }));
  };

  const handleCorporateStructureChange = (newStructure) => {
    setCompany(prevCompany => ({
      ...prevCompany,
      corporateStructure: newStructure
    }));
  };

  const updateCompanyApi = () => {
    let companyData = companyBuilder(company);
    if (companyData && id) {
      updateCompanyById(id, companyData)
        .then((response) => {
          setCompany(response.data);
          setSubmitted(true);
          console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
          alert('Erro ao atualizar empresa. Verifique os dados e tente novamente.');
        });
    }
  };

  const goToCompaniesList = () => {
    navigate('/empresas');
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Carregando dados da empresa...</Typography>
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
            A empresa foi atualizada com sucesso!
          </Typography>
          <Button
            variant='contained'
            color='success'
            onClick={goToCompaniesList}>
            Voltar para Lista
          </Button>
        </Box>
      ) : (
        <>
          <CompanyForm
            formTitle={'Editar Empresa'}
            company={company}
            handleInputChange={handleInputChange}
            handleDateChange={handleDateChange}
            handleContactsChange={handleContactsChange}
            handleActivitiesChange={handleActivitiesChange}
            handleCorporateStructureChange={handleCorporateStructureChange}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant='contained'
              color='primary'
              onClick={updateCompanyApi}>
              Atualizar Empresa
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={goToCompaniesList}>
              Cancelar
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default EditCompany;
