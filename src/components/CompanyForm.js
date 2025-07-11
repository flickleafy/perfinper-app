import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
} from '@mui/material';
import { ExpandMore, Add, Delete } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';

const CompanyForm = ({
  formTitle,
  company,
  handleInputChange,
  handleDateChange,
  handleContactsChange,
  handleActivitiesChange,
  handleCorporateStructureChange,
}) => {
  const companyStatuses = [
    { id: 'Ativa', name: 'Ativa' },
    { id: 'Inativa', name: 'Inativa' },
    { id: 'Suspensa', name: 'Suspensa' },
    { id: 'Baixada', name: 'Baixada' },
  ];

  const companyTypes = [
    { id: 'Matriz', name: 'Matriz' },
    { id: 'Filial', name: 'Filial' },
  ];

  const [phones, setPhones] = useState(company.contacts?.phones || ['']);
  const [socialMedia, setSocialMedia] = useState(company.contacts?.socialMedia || []);
  const [secondaryActivities, setSecondaryActivities] = useState(company.activities?.secondary || []);
  const [corporateStructure, setCorporateStructure] = useState(company.corporateStructure || []);

  useEffect(() => {
    if (handleContactsChange) {
      handleContactsChange({
        ...company.contacts,
        phones,
        socialMedia,
      });
    }
  }, [phones, socialMedia]);

  useEffect(() => {
    if (handleActivitiesChange) {
      handleActivitiesChange({
        ...company.activities,
        secondary: secondaryActivities,
      });
    }
  }, [secondaryActivities]);

  useEffect(() => {
    if (handleCorporateStructureChange) {
      handleCorporateStructureChange(corporateStructure);
    }
  }, [corporateStructure]);

  const handleAddPhone = () => {
    setPhones([...phones, '']);
  };

  const handleRemovePhone = (index) => {
    setPhones(phones.filter((_, i) => i !== index));
  };

  const handlePhoneChange = (index, value) => {
    const updatedPhones = [...phones];
    updatedPhones[index] = value;
    setPhones(updatedPhones);
  };

  const handleAddSocialMedia = () => {
    setSocialMedia([...socialMedia, { platform: '', handle: '', url: '', isActive: true }]);
  };

  const handleRemoveSocialMedia = (index) => {
    setSocialMedia(socialMedia.filter((_, i) => i !== index));
  };

  const handleSocialMediaChange = (index, field, value) => {
    const updatedSocialMedia = [...socialMedia];
    updatedSocialMedia[index] = { ...updatedSocialMedia[index], [field]: value };
    setSocialMedia(updatedSocialMedia);
  };

  const handleAddSecondaryActivity = () => {
    setSecondaryActivities([...secondaryActivities, { code: '', description: '' }]);
  };

  const handleRemoveSecondaryActivity = (index) => {
    setSecondaryActivities(secondaryActivities.filter((_, i) => i !== index));
  };

  const handleSecondaryActivityChange = (index, field, value) => {
    const updatedActivities = [...secondaryActivities];
    updatedActivities[index] = { ...updatedActivities[index], [field]: value };
    setSecondaryActivities(updatedActivities);
  };

  const handleAddCorporateStructure = () => {
    setCorporateStructure([...corporateStructure, { name: '', type: '', cnpj: '', country: '' }]);
  };

  const handleRemoveCorporateStructure = (index) => {
    setCorporateStructure(corporateStructure.filter((_, i) => i !== index));
  };

  const handleCorporateStructureFieldChange = (index, field, value) => {
    const updatedStructure = [...corporateStructure];
    updatedStructure[index] = { ...updatedStructure[index], [field]: value };
    setCorporateStructure(updatedStructure);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {formTitle}
        </Typography>

        {/* Basic Information */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Informações Básicas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nome da Empresa"
                  name="companyName"
                  value={company.companyName || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="CNPJ"
                  name="companyCnpj"
                  value={company.companyCnpj || ''}
                  onChange={handleInputChange}
                  placeholder="00.000.000/0000-00"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Razão Social"
                  name="corporateName"
                  value={company.corporateName || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome Fantasia"
                  name="tradeName"
                  value={company.tradeName || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={company.status || ''}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    {companyStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Tipo</InputLabel>
                  <Select
                    name="companyType"
                    value={company.companyType || ''}
                    onChange={handleInputChange}
                    label="Tipo"
                  >
                    {companyTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Data de Fundação"
                  value={company.foundationDate}
                  onChange={(date) => handleDateChange('foundationDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Porte da Empresa"
                  name="companySize"
                  value={company.companySize || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Natureza Jurídica"
                  name="legalNature"
                  value={company.legalNature || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Capital Social"
                  name="shareCapital"
                  value={company.shareCapital || ''}
                  onChange={handleInputChange}
                  placeholder="R$ 0,00"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Data da Situação Cadastral"
                  value={company.statusDate}
                  onChange={(date) => handleDateChange('statusDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={company.microEntrepreneurOption || false}
                      onChange={(e) => handleInputChange({
                        target: { name: 'microEntrepreneurOption', value: e.target.checked }
                      })}
                      name="microEntrepreneurOption"
                    />
                  }
                  label="Opção MEI"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={company.simplifiedTaxOption || false}
                      onChange={(e) => handleInputChange({
                        target: { name: 'simplifiedTaxOption', value: e.target.checked }
                      })}
                      name="simplifiedTaxOption"
                    />
                  }
                  label="Simples Nacional"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Address Information */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Endereço</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Logradouro"
                  name="address.street"
                  value={company.address?.street || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número"
                  name="address.number"
                  value={company.address?.number || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Complemento"
                  name="address.complement"
                  value={company.address?.complement || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bairro"
                  name="address.neighborhood"
                  value={company.address?.neighborhood || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="address.zipCode"
                  value={company.address?.zipCode || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  name="address.city"
                  value={company.address?.city || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="address.state"
                  value={company.address?.state || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="País"
                  name="address.country"
                  value={company.address?.country || 'Brasil'}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Contact Information */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Contatos</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="contacts.email"
                  type="email"
                  value={company.contacts?.email || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Website"
                  name="contacts.website"
                  value={company.contacts?.website || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              
              {/* Phones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Telefones</Typography>
                  <IconButton onClick={handleAddPhone} size="small">
                    <Add />
                  </IconButton>
                </Box>
                {phones.map((phone, index) => (
                  <Box key={`phone-${index}-${phone}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Telefone ${index + 1}`}
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => handleRemovePhone(index)} size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Grid>

              {/* Social Media */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Redes Sociais</Typography>
                  <IconButton onClick={handleAddSocialMedia} size="small">
                    <Add />
                  </IconButton>
                </Box>
                {socialMedia.map((social, index) => (
                  <Box key={`social-${index}`} sx={{ border: '1px dashed grey', p: 2, mb: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                          <InputLabel>Plataforma</InputLabel>
                          <Select
                            value={social.platform}
                            onChange={(e) => handleSocialMediaChange(index, 'platform', e.target.value)}
                            label="Plataforma"
                            data-testid={`social-platform-select-${index}`}
                          >
                            <MenuItem value="Facebook">Facebook</MenuItem>
                            <MenuItem value="Instagram">Instagram</MenuItem>
                            <MenuItem value="Twitter">Twitter</MenuItem>
                            <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                            <MenuItem value="YouTube">YouTube</MenuItem>
                            <MenuItem value="TikTok">TikTok</MenuItem>
                            <MenuItem value="Pinterest">Pinterest</MenuItem>
                            <MenuItem value="Other">Outro</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <TextField
                          fullWidth
                          label="Handle/Username"
                          value={social.handle}
                          onChange={(e) => handleSocialMediaChange(index, 'handle', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="URL"
                          value={social.url}
                          onChange={(e) => handleSocialMediaChange(index, 'url', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={social.isActive || false}
                              onChange={(e) => handleSocialMediaChange(index, 'isActive', e.target.checked)}
                            />
                          }
                          label="Ativo"
                        />
                      </Grid>
                    </Grid>
                    <IconButton onClick={() => handleRemoveSocialMedia(index)} size="small" sx={{ mt: 1 }}>
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Corporate Structure */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Estrutura Societária</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle1">Sócios</Typography>
              <IconButton onClick={handleAddCorporateStructure} size="small">
                <Add />
              </IconButton>
            </Box>
            {corporateStructure.map((partner, index) => (
              <Box key={`partner-${index}`} sx={{ border: '1px dashed grey', p: 2, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Sócio"
                      value={partner.name}
                      onChange={(e) => handleCorporateStructureFieldChange(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo</InputLabel>
                      <Select
                        value={partner.type}
                        onChange={(e) => handleCorporateStructureFieldChange(index, 'type', e.target.value)}
                        label="Tipo"
                        data-testid={`partner-type-select-${index}`}
                      >
                        <MenuItem value="Administrador">Administrador</MenuItem>
                        <MenuItem value="Sócio">Sócio</MenuItem>
                        <MenuItem value="Procurador">Procurador</MenuItem>
                        <MenuItem value="Vendedor">Vendedor</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="CNPJ/CPF do Sócio"
                      value={partner.cnpj}
                      onChange={(e) => handleCorporateStructureFieldChange(index, 'cnpj', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="País de Origem"
                      value={partner.country}
                      onChange={(e) => handleCorporateStructureFieldChange(index, 'country', e.target.value)}
                    />
                  </Grid>
                </Grid>
                <IconButton onClick={() => handleRemoveCorporateStructure(index)} size="small" sx={{ mt: 1 }}>
                  <Delete />
                </IconButton>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Activities */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Atividades</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Atividade Principal"
                  name="activities.primary.description"
                  value={company.activities?.primary?.description || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Código da Atividade Principal"
                  name="activities.primary.code"
                  value={company.activities?.primary?.code || ''}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Secondary Activities */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Atividades Secundárias</Typography>
                  <IconButton onClick={handleAddSecondaryActivity} size="small">
                    <Add />
                  </IconButton>
                </Box>
                {secondaryActivities.map((activity, index) => (
                  <Box key={`activity-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Descrição da Atividade ${index + 1}`}
                      value={activity.description}
                      onChange={(e) => handleSecondaryActivityChange(index, 'description', e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <TextField
                      fullWidth
                      label={`Código da Atividade ${index + 1}`}
                      value={activity.code}
                      onChange={(e) => handleSecondaryActivityChange(index, 'code', e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => handleRemoveSecondaryActivity(index)} size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Statistics */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Estatísticas</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Total de Transações"
                  value={company.statistics?.totalTransactions || 0}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Valor Total das Transações"
                  value={company.statistics?.totalTransactionValue || 'R$ 0,00'}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Última Transação"
                  value={company.statistics?.lastTransaction ? 
                    new Date(company.statistics.lastTransaction).toLocaleDateString('pt-BR') : 
                    'Nenhuma'
                  }
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </LocalizationProvider>
  );
};

CompanyForm.propTypes = {
  formTitle: PropTypes.string.isRequired,
  company: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleContactsChange: PropTypes.func,
  handleActivitiesChange: PropTypes.func,
  handleCorporateStructureChange: PropTypes.func,
};

export default CompanyForm;
