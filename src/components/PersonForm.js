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
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { ptBR } from 'date-fns/locale';

const PersonForm = ({
  formTitle,
  person,
  handleInputChange,
  handleDateChange,
  handleContactsChange,
  handlePersonalBusinessChange,
}) => {
  const personStatuses = [
    { id: 'active', name: 'Ativo' },
    { id: 'inactive', name: 'Inativo' },
    { id: 'blocked', name: 'Bloqueado' },
    { id: 'anonymous', name: 'Anônimo' },
  ];

  const [phones, setPhones] = useState(person.contacts?.phones || ['']);
  const [emails, setEmails] = useState(person.contacts?.emails || ['']);
  const [cellphones, setCellphones] = useState(person.contacts?.cellphones || ['']);

  useEffect(() => {
    if (handleContactsChange) {
      handleContactsChange({
        ...person.contacts,
        phones,
        emails,
        cellphones,
      });
    }
  }, [phones, emails, cellphones]);

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

  const handleAddEmail = () => {
    setEmails([...emails, '']);
  };

  const handleRemoveEmail = (index) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index, value) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  const handleAddCellphone = () => {
    setCellphones([...cellphones, '']);
  };

  const handleRemoveCellphone = (index) => {
    setCellphones(cellphones.filter((_, i) => i !== index));
  };

  const handleCellphoneChange = (index, value) => {
    const updatedCellphones = [...cellphones];
    updatedCellphones[index] = value;
    setCellphones(updatedCellphones);
  };

  const handlePersonalBusinessFieldChange = (field, value) => {
    if (handlePersonalBusinessChange) {
      handlePersonalBusinessChange({
        ...person.personalBusiness,
        [field]: value,
      });
    }
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
            <Typography variant="h6">Informações Pessoais</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Nome Completo"
                  name="fullName"
                  value={person.fullName || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="CPF"
                  name="cpf"
                  value={person.cpf || ''}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="RG"
                  name="rg"
                  value={person.rg || ''}
                  onChange={handleInputChange}
                  placeholder="00.000.000-0"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Data de Nascimento"
                  value={person.dateOfBirth}
                  onChange={(date) => handleDateChange('dateOfBirth', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Profissão"
                  name="profession"
                  value={person.profession || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={person.status || ''}
                    onChange={handleInputChange}
                    label="Status"
                  >
                    {personStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.id}>
                        {status.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                  value={person.address?.street || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Número"
                  name="address.number"
                  value={person.address?.number || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Complemento"
                  name="address.complement"
                  value={person.address?.complement || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bairro"
                  name="address.neighborhood"
                  value={person.address?.neighborhood || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="address.zipCode"
                  value={person.address?.zipCode || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cidade"
                  name="address.city"
                  value={person.address?.city || ''}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Estado"
                  name="address.state"
                  value={person.address?.state || ''}
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
              {/* Emails */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Emails</Typography>
                  <IconButton onClick={handleAddEmail} size="small">
                    <Add />
                  </IconButton>
                </Box>
                {emails.map((email, index) => (
                  <Box key={`email-${email}-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Email ${index + 1}`}
                      type="email"
                      value={email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => handleRemoveEmail(index)} size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
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
                  <Box key={`phone-${phone}-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
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

              {/* Cellphones */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1">Celulares</Typography>
                  <IconButton onClick={handleAddCellphone} size="small">
                    <Add />
                  </IconButton>
                </Box>
                {cellphones.map((cellphone, index) => (
                  <Box key={`cellphone-${cellphone}-${index}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Celular ${index + 1}`}
                      value={cellphone}
                      onChange={(e) => handleCellphoneChange(index, e.target.value)}
                      sx={{ mr: 1 }}
                    />
                    <IconButton onClick={() => handleRemoveCellphone(index)} size="small">
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Personal Business Information */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Negócio Pessoal</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={person.personalBusiness?.hasPersonalBusiness || false}
                      onChange={(e) => handlePersonalBusinessFieldChange('hasPersonalBusiness', e.target.checked)}
                    />
                  }
                  label="Possui negócio pessoal"
                />
              </Grid>
              
              {person.personalBusiness?.hasPersonalBusiness && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nome do Negócio"
                      value={person.personalBusiness?.businessName || ''}
                      onChange={(e) => handlePersonalBusinessFieldChange('businessName', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Tipo de Negócio</InputLabel>
                      <Select
                        value={person.personalBusiness?.businessType || ''}
                        onChange={(e) => handlePersonalBusinessFieldChange('businessType', e.target.value)}
                        label="Tipo de Negócio"
                      >
                        <MenuItem value="taxi">Taxi</MenuItem>
                        <MenuItem value="uber">Uber</MenuItem>
                        <MenuItem value="delivery">Delivery</MenuItem>
                        <MenuItem value="freelancer">Freelancer</MenuItem>
                        <MenuItem value="consultant">Consultor</MenuItem>
                        <MenuItem value="teacher">Professor</MenuItem>
                        <MenuItem value="tutor">Tutor</MenuItem>
                        <MenuItem value="hairdresser">Cabeleireiro</MenuItem>
                        <MenuItem value="mechanic">Mecânico</MenuItem>
                        <MenuItem value="electrician">Eletricista</MenuItem>
                        <MenuItem value="plumber">Encanador</MenuItem>
                        <MenuItem value="carpenter">Carpinteiro</MenuItem>
                        <MenuItem value="painter">Pintor</MenuItem>
                        <MenuItem value="cleaner">Faxineiro</MenuItem>
                        <MenuItem value="gardener">Jardineiro</MenuItem>
                        <MenuItem value="street_vendor">Vendedor Ambulante</MenuItem>
                        <MenuItem value="food_vendor">Vendedor de Comida</MenuItem>
                        <MenuItem value="artisan">Artesão</MenuItem>
                        <MenuItem value="photographer">Fotógrafo</MenuItem>
                        <MenuItem value="musician">Músico</MenuItem>
                        <MenuItem value="artist">Artista</MenuItem>
                        <MenuItem value="writer">Escritor</MenuItem>
                        <MenuItem value="translator">Tradutor</MenuItem>
                        <MenuItem value="developer">Desenvolvedor</MenuItem>
                        <MenuItem value="designer">Designer</MenuItem>
                        <MenuItem value="other">Outro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Categoria do Negócio</InputLabel>
                      <Select
                        value={person.personalBusiness?.businessCategory || ''}
                        onChange={(e) => handlePersonalBusinessFieldChange('businessCategory', e.target.value)}
                        label="Categoria do Negócio"
                      >
                        <MenuItem value="transport">Transporte</MenuItem>
                        <MenuItem value="education">Educação</MenuItem>
                        <MenuItem value="beauty">Beleza</MenuItem>
                        <MenuItem value="construction">Construção</MenuItem>
                        <MenuItem value="maintenance">Manutenção</MenuItem>
                        <MenuItem value="food_service">Serviços de Alimentação</MenuItem>
                        <MenuItem value="retail">Varejo</MenuItem>
                        <MenuItem value="services">Serviços</MenuItem>
                        <MenuItem value="technology">Tecnologia</MenuItem>
                        <MenuItem value="arts">Artes</MenuItem>
                        <MenuItem value="health">Saúde</MenuItem>
                        <MenuItem value="consulting">Consultoria</MenuItem>
                        <MenuItem value="other">Outro</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={person.personalBusiness?.isFormalized || false}
                          onChange={(e) => handlePersonalBusinessFieldChange('isFormalized', e.target.checked)}
                        />
                      }
                      label="Negócio formalizado (MEI)"
                    />
                  </Grid>
                  {person.personalBusiness?.isFormalized && (
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Número MEI"
                        value={person.personalBusiness?.mei || ''}
                        onChange={(e) => handlePersonalBusinessFieldChange('mei', e.target.value)}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Descrição do Negócio"
                      value={person.personalBusiness?.businessDescription || ''}
                      onChange={(e) => handlePersonalBusinessFieldChange('businessDescription', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Horário de Funcionamento"
                      value={person.personalBusiness?.workingHours || ''}
                      onChange={(e) => handlePersonalBusinessFieldChange('workingHours', e.target.value)}
                      placeholder="Ex: Segunda a Sexta, 8h às 18h"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Área de Atendimento"
                      value={person.personalBusiness?.serviceArea || ''}
                      onChange={(e) => handlePersonalBusinessFieldChange('serviceArea', e.target.value)}
                      placeholder="Ex: São Paulo - SP"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Faturamento Médio Mensal"
                      type="number"
                      value={person.personalBusiness?.averageMonthlyRevenue || ''}
                      onChange={(e) => handlePersonalBusinessFieldChange('averageMonthlyRevenue', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      InputProps={{
                        startAdornment: 'R$ ',
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Observações do Negócio"
                      value={person.personalBusiness?.businessNotes || ''}
                      onChange={(e) => handlePersonalBusinessFieldChange('businessNotes', e.target.value)}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Notes */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Observações</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Observações Gerais"
                  name="notes"
                  value={person.notes || ''}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Box>
    </LocalizationProvider>
  );
};

PersonForm.propTypes = {
  formTitle: PropTypes.string.isRequired,
  person: PropTypes.object.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  handleDateChange: PropTypes.func.isRequired,
  handleContactsChange: PropTypes.func,
  handlePersonalBusinessChange: PropTypes.func,
};

export default PersonForm;
