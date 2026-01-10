import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyBuilder } from '../objectsBuilder.js';
import { insertCompany } from '../../services/companyService.js';

// MUI Components
import { Button, Typography, Box } from '@mui/material';
import { companyPrototype } from '../entityPrototypes.js';
import CompanyForm from '../CompanyForm.js';
import { useToast } from '../../ui/ToastProvider.js';

const InsertCompany = () => {
  const { showToast } = useToast();
  const initialCompanyState = companyPrototype();
  const navigate = useNavigate();

  const [company, setCompany] = useState(initialCompanyState);
  const [submitted, setSubmitted] = useState(false);

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

  const insertCompanyApi = () => {
    let companyData = companyBuilder(company);
    if (companyData) {
      insertCompany(companyData)
        .then((response) => {
          setCompany(response.data);
          setSubmitted(true);
          // console.log(response.data);
        })
        .catch((e) => {
          console.error(e);
          showToast(
            'Erro ao salvar empresa. Verifique os dados e tente novamente.',
            'error'
          );
        });
    }
  };

  const newCompany = () => {
    setCompany(initialCompanyState);
    setSubmitted(false);
  };

  const goBackToCompanies = () => {
    navigate('/empresas');
  };

  return (
    <Box
      paddingLeft={8}
      paddingRight={8}
      paddingBottom={8}>
      {submitted ? (
        <Box>
          <Typography variant='h4'>
            A empresa foi inserida com sucesso!
          </Typography>
          <Button
            variant='contained'
            color='success'
            onClick={newCompany}>
            Inserir Outra
          </Button>
        </Box>
      ) : (
        <>
          <CompanyForm
            formTitle={'Inserir Empresa'}
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
              onClick={insertCompanyApi}>
              Salvar Empresa
            </Button>
            <Button
              variant='outlined'
              color='secondary'
              onClick={newCompany}>
              Limpar Formulário
            </Button>
            <Button
              variant='outlined'
              color='info'
              onClick={goBackToCompanies}>
              Voltar para Lista de Empresas
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default InsertCompany;
