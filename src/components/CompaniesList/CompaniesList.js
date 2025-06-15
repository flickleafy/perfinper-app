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
  useTheme,
} from '@mui/material';
import { Edit, Delete, Business, LocationCity } from '@mui/icons-material';
import localStorage from 'local-storage';
import {
  findAllCompanies,
  deleteCompanyById,
  deleteCompaniesByIds,
} from '../../services/companyService.js';

import LoadingIndicator from '../../ui/LoadingIndicator.js';
import SimpleSearchBar from '../../ui/SimpleSearchBar.js';

const CompaniesList = () => {
  const theme = useTheme();
  const [fullCompaniesList, setFullCompaniesList] = useState([]);
  const [companiesPrintList, setCompaniesPrintList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  useEffect(() => {
    if (!initializeFromLocalStorage()) {
      retrieveAllCompanies();
    }
  }, []);

  useEffect(() => {
    searchCompanies();
  }, [searchTerm, fullCompaniesList]);

  const retrieveAllCompanies = () => {
    findAllCompanies()
      .then((response) => {
        setFullCompaniesList(response.data);
        setCompaniesPrintList(response.data);
        localStorage.set('fullCompaniesList', response.data);
        localStorage.set('companiesPrintList', response.data);
        console.log(response.data);
      })
      .catch((e) => {
        console.error(e);
      });
  };

  const initializeFromLocalStorage = () => {
    let tmpFCL = localStorage.get('fullCompaniesList');
    let tmpCPL = localStorage.get('companiesPrintList');
    let tmpST = localStorage.get('companySearchTerm');

    if (tmpFCL && tmpCPL) {
      setFullCompaniesList(tmpFCL);
      setCompaniesPrintList(tmpCPL);
      setSearchTerm(tmpST || '');
      return true;
    }
    return false;
  };

  const refreshList = () => {
    retrieveAllCompanies();
    setSearchTerm('');
    localStorage.remove('companySearchTerm');
  };

  const searchCompanies = () => {
    if (searchTerm === '') {
      setCompaniesPrintList(fullCompaniesList);
    } else {
      const filteredCompanies = fullCompaniesList.filter((company) =>
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.companyCnpj.includes(searchTerm) ||
        (company.tradeName && company.tradeName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.address?.city && company.address.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.address?.state && company.address.state.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setCompaniesPrintList(filteredCompanies);
    }
    localStorage.set('companiesPrintList', companiesPrintList);
    localStorage.set('companySearchTerm', searchTerm);
  };

  const removeCompany = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      deleteCompanyById(id)
        .then(() => {
          refreshList();
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const removeSelectedCompanies = () => {
    if (selectedCompanies.length === 0) return;
    
    if (window.confirm(`Tem certeza que deseja excluir ${selectedCompanies.length} empresa(s)?`)) {
      deleteCompaniesByIds(selectedCompanies)
        .then(() => {
          setSelectedCompanies([]);
          refreshList();
        })
        .catch((e) => {
          console.error(e);
        });
    }
  };

  const handleCompanySelection = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativa':
        return theme.palette.success.main;
      case 'Inativa':
        return theme.palette.warning.main;
      case 'Suspensa':
        return theme.palette.error.main;
      case 'Baixada':
        return theme.palette.grey[500];
      default:
        return theme.palette.primary.main;
    }
  };

  const formatCnpj = (cnpj) => {
    if (!cnpj) return '';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  return (
    <Box sx={{ padding: 2 }}>
      <LoadingIndicator />
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestão de Empresas
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <SimpleSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar por nome, CNPJ, cidade..."
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Link to="/empresas/inserir" style={{ textDecoration: 'none' }}>
                <button className="btn btn-primary">Nova Empresa</button>
              </Link>
              {selectedCompanies.length > 0 && (
                <button 
                  className="btn btn-danger" 
                  onClick={removeSelectedCompanies}
                >
                  Excluir Selecionadas ({selectedCompanies.length})
                </button>
              )}
              <button className="btn btn-secondary" onClick={refreshList}>
                Atualizar
              </button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      <Paper elevation={1}>
        <List>
          {companiesPrintList.map((company, index) => (
            <ListItem key={company.id || index} divider>
              <ListItemIcon>
                <input
                  type="checkbox"
                  checked={selectedCompanies.includes(company.id)}
                  onChange={() => handleCompanySelection(company.id)}
                />
              </ListItemIcon>
              
              <ListItemIcon>
                <Business color="primary" />
              </ListItemIcon>
              
              <ListItemText
                primary={
                  <Box>
                    <Typography variant="h6" component="div">
                      {company.companyName}
                    </Typography>
                    {company.tradeName && company.tradeName !== company.companyName && (
                      <Typography variant="body2" color="text.secondary">
                        Nome Fantasia: {company.tradeName}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" component="div">
                      <strong>CNPJ:</strong> {formatCnpj(company.companyCnpj)}
                    </Typography>
                    {company.address?.city && (
                      <Typography variant="body2" component="div">
                        <LocationCity fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                        {company.address.city}{company.address.state && `, ${company.address.state}`}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={company.status}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(company.status),
                          color: 'white',
                        }}
                      />
                      {company.companyType && (
                        <Chip
                          label={company.companyType}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {company.microEntrepreneurOption && (
                        <Chip
                          label="MEI"
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
                  to={`/empresas/editar/${company.id}`}
                  color="primary"
                  size="small"
                >
                  <Edit />
                </IconButton>
                <IconButton
                  onClick={() => removeCompany(company.id)}
                  color="error"
                  size="small"
                >
                  <Delete />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
        
        {companiesPrintList.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Nenhuma empresa encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Tente ajustar os termos de busca' : 'Comece adicionando uma nova empresa'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CompaniesList;
