import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Grid,
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Checkbox,
  useTheme,
} from '@mui/material';
import { Edit, Delete, Person, LocationCity, Business } from '@mui/icons-material';
import localStorage from 'local-storage';
import {
  findAllPeople,
  deletePersonById,
} from '../../services/personService.js';

import LoadingIndicator from '../../ui/LoadingIndicator.js';
import SimpleSearchBar from '../../ui/SimpleSearchBar.js';

const PeopleList = () => {
  const theme = useTheme();
  const [fullPeopleList, setFullPeopleList] = useState([]);
  const [peoplePrintList, setPeoplePrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeople, setSelectedPeople] = useState([]);

  useEffect(() => {
    if (!initializeFromLocalStorage()) {
      retrieveAllPeople();
    }
  }, []);

  useEffect(() => {
    searchPeople();
  }, [searchTerm, fullPeopleList]);

  const retrieveAllPeople = () => {
    findAllPeople()
      .then((response) => {
        setFullPeopleList(response.data);
        setPeoplePrintList(response.data);
        localStorage.set('fullPeopleList', response.data);
        localStorage.set('peoplePrintList', response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const initializeFromLocalStorage = () => {
    let tmpFPL = localStorage.get('fullPeopleList');
    let tmpPPL = localStorage.get('peoplePrintList');
    let tmpST = localStorage.get('peopleSearchTerm');

    if (tmpFPL && tmpPPL) {
      setFullPeopleList(tmpFPL);
      setPeoplePrintList(tmpPPL);
      setSearchTerm(tmpST || '');
      return true;
    }
    return false;
  };

  const refreshList = () => {
    retrieveAllPeople();
    setSearchTerm('');
    localStorage.remove('peopleSearchTerm');
  };

  const searchPeople = () => {
    if (searchTerm === '') {
      setPeoplePrintList(fullPeopleList);
    } else {
      const filteredPeople = fullPeopleList.filter((person) =>
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.cpf.includes(searchTerm) ||
        (person.address?.city && person.address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.address?.state && person.address.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (person.personalBusiness?.businessName && 
         person.personalBusiness.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setPeoplePrintList(filteredPeople);
    }
    localStorage.set('peoplePrintList', peoplePrintList);
    localStorage.set('peopleSearchTerm', searchTerm);
  };

  const removePerson = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta pessoa?')) {
      deletePersonById(id)
        .then(() => {
          refreshList();
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const handlePersonSelection = (personId) => {
    setSelectedPeople(prev => 
      prev.includes(personId) 
        ? prev.filter(id => id !== personId)
        : [...prev, personId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo':
        return theme.palette.success.main;
      case 'Inativo':
        return theme.palette.warning.main;
      case 'Suspenso':
        return theme.palette.error.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const formatCpf = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDateOfBirth = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <Box sx={{ padding: 2 }}>
      <LoadingIndicator />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestão de Pessoas
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <SimpleSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar por nome, CPF, cidade..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Grid
              container
              justifyContent='flex-end'
              sx={{ gap: 2 }}>
              <Button
                component={Link}
                to="/pessoas/inserir"
                variant='contained'
                color='primary'>
                Nova Pessoa
              </Button>
              <Button
                variant='contained'
                color='secondary'
                onClick={refreshList}>
                Atualizar
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Paper elevation={1}>
        <List>
          {peoplePrintList.map((person, index) => (
            <ListItem key={person.id || index} divider>
              <ListItemIcon>
                <Checkbox
                  checked={selectedPeople.includes(person.id)}
                  onChange={() => handlePersonSelection(person.id)}
                />
              </ListItemIcon>
              
              <ListItemIcon>
                <Person color="primary" />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="h6" component="div">
                      {person.fullName}
                    </Typography>
                    {person.personalBusiness?.hasPersonalBusiness && person.personalBusiness?.businessName && (
                      <Typography variant="body2" color="text.secondary">
                        Negócio: {person.personalBusiness.businessName}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" component="div">
                      <strong>CPF:</strong> {formatCpf(person.cpf)}
                    </Typography>
                    {person.dateOfBirth && (
                      <Typography variant="body2" component="div">
                        <strong>Nascimento:</strong> {formatDateOfBirth(person.dateOfBirth)}
                      </Typography>
                    )}
                    {person.address?.city && (
                      <Typography variant="body2" component="div">
                        <LocationCity fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {person.address.city}{person.address.state && `, ${person.address.state}`}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={person.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(person.status),
                          color: 'white',
                        }}
                      />
                      {person.gender && (
                        <Chip
                          label={person.gender}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {person.personalBusiness?.hasPersonalBusiness && (
                        <Chip
                          icon={<Business />}
                          label={person.personalBusiness.isFormalized ? 'MEI' : 'Informal'}
                          size="small"
                          color={person.personalBusiness.isFormalized ? 'success' : 'warning'}
                          variant="outlined"
                        />
                      )}
                      {person.personalBusiness?.businessCategory && (
                        <Chip
                          label={person.personalBusiness.businessCategory}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                }
              />
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <IconButton
                  component={Link}
                  to={`/pessoas/editar/${person.id}`}
                  color="primary"
                  size="small"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => removePerson(person.id)}
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        
        {peoplePrintList.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Nenhuma pessoa encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando uma nova pessoa'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PeopleList;
