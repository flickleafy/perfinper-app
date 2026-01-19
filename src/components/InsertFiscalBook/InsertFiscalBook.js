import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { NavigateNext as NavigateNextIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import FiscalBookForm from '../FiscalBookForm';

/**
 * InsertFiscalBook - Component for creating new fiscal books
 */
function InsertFiscalBook({ onSuccess, onCancel }) {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState('');

  // Handle successful creation
  const handleSuccess = (createdFiscalBook) => {
    setSuccessMessage(`Livro fiscal "${createdFiscalBook.bookName || createdFiscalBook.name}" foi criado com sucesso!`);
    
    // Call success callback after a short delay to show the success message
    setTimeout(() => {
      if (onSuccess) {
        onSuccess(createdFiscalBook);
      }
      // Navigate back to fiscal books list after showing success message
      navigate('/livros-fiscais');
    }, 2000);
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    navigate('/livros-fiscais');
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/livros-fiscais');
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 2 }}
      >
        <Link
          component="button"
          variant="body1"
          onClick={handleBack}
          sx={{ textDecoration: 'none' }}
        >
          Livros Fiscais
        </Link>
        <Typography color="text.primary">Criar Novo</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Voltar aos Livros Fiscais
      </Button>

      {/* Success Message */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Main Content */}
      <Paper elevation={1} sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 3 }}>
          <Typography variant="h4" component="h1">
            Criar Novo Livro Fiscal
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            Configure um novo livro fiscal para organizar suas transações financeiras
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Instructions */}
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>O que é um Livro Fiscal?</strong><br />
              Um Livro Fiscal é um contêiner para organizar suas transações financeiras por período ou categoria. 
              Cada transação pertence a exatamente um livro fiscal, facilitando o gerenciamento de suas finanças 
              e a geração de relatórios para períodos específicos.
            </Typography>
          </Alert>

          {/* Form */}
          <FiscalBookForm
            onSave={handleSuccess}
            onCancel={handleCancel}
            isEditing={false}
          />

          {/* Guidelines */}
          <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Diretrizes para Criar Livros Fiscais
            </Typography>
            <Typography variant="body2" component="div" sx={{ pl: 2 }}>
              <ul>
                <li><strong>Nome:</strong> Use nomes descritivos como "Registros Anuais 2024" ou "Despesas Pessoais 2024"</li>
                <li><strong>Período:</strong> Cada livro fiscal deve representar um período específico (ex: 2024 ou 2024-01)</li>
                <li><strong>Tipo:</strong> Escolha o tipo apropriado (Entrada, Saída, Serviços, etc.)</li>
                <li><strong>Observações:</strong> Adicione notas sobre que tipos de transações este livro conterá</li>
                <li><strong>Status:</strong> Mantenha livros abertos enquanto adicionar transações, feche-os quando o período terminar</li>
              </ul>
            </Typography>
          </Box>

          {/* Best Practices */}
          <Box sx={{ mt: 2, p: 3, bgcolor: 'info.light', color: 'info.contrastText', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              Melhores Práticas
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li>Crie livros separados para diferentes anos ou propósitos</li>
                <li>Use convenções de nomenclatura consistentes em seus livros</li>
                <li>Feche livros no final de seus respectivos períodos</li>
                <li>Faça backup regularmente de seus livros fiscais exportando-os</li>
              </ul>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

InsertFiscalBook.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

InsertFiscalBook.defaultProps = {
  onSuccess: null,
  onCancel: null,
};

export default InsertFiscalBook;
