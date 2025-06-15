import { formatDatePeriod } from '../infrastructure/date/formatDatePeriod';

// helper functions
export function transactionBuilder(body, date) {
  let {
    transactionDate,
    transactionPeriod,
    transactionSource,
    transactionValue,
    transactionName,
    transactionDescription,
    transactionFiscalNote,
    transactionId,
    transactionStatus,
    transactionLocation,
    transactionType,
    transactionCategory,
    freightValue,
    paymentMethod,
    items,
    companyName,
    companySellerName,
    companyCnpj,
  } = body;

  if (date) {
    ({ transactionDate, transactionPeriod } = formatDatePeriod(date));
  }

  transactionValue = String(transactionValue).replace('.', ',');
  freightValue = String(freightValue).replace('.', ',');

  return {
    id: null,
    transactionDate,
    transactionPeriod,
    transactionSource,
    transactionValue,
    transactionName,
    transactionDescription,
    transactionFiscalNote,
    transactionId,
    transactionStatus,
    transactionLocation,
    transactionType,
    transactionCategory,
    freightValue,
    paymentMethod,
    items,
    companyName,
    companySellerName,
    companyCnpj,
  };
}

// Company builder function
export function companyBuilder(body) {
  let {
    companyName,
    companyCnpj,
    corporateName,
    tradeName,
    foundationDate,
    companySize,
    legalNature,
    microEntrepreneurOption,
    simplifiedTaxOption,
    shareCapital,
    companyType,
    status,
    statusDate,
    contacts,
    address,
    activities,
    corporateStructure,
    statistics,
  } = body;

  // Clean and format CNPJ
  if (companyCnpj) {
    companyCnpj = String(companyCnpj).replace(/[^\d]/g, '');
  }

  return {
    id: null,
    companyName: String(companyName || '').trim(),
    companyCnpj,
    corporateName: String(corporateName || '').trim(),
    tradeName: String(tradeName || '').trim(),
    foundationDate,
    companySize: String(companySize || '').trim(),
    legalNature: String(legalNature || '').trim(),
    microEntrepreneurOption: Boolean(microEntrepreneurOption),
    simplifiedTaxOption: Boolean(simplifiedTaxOption),
    shareCapital: String(shareCapital || '').trim(),
    companyType,
    status: status || 'Ativa',
    statusDate,
    contacts: contacts || {
      email: '',
      phones: [''],
      website: '',
      socialMedia: [],
    },
    address: address || {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      zipCode: '',
      city: '',
      state: '',
      country: 'Brasil',
    },
    activities: activities || {
      primary: { code: '', description: '' },
      secondary: [],
    },
    corporateStructure: corporateStructure || [],
    statistics: statistics || {
      totalTransactions: 0,
      totalTransactionValue: '0',
      lastTransaction: null,
    },
  };
}

// Person builder function
export function personBuilder(body) {
  let {
    fullName,
    cpf,
    rg,
    dateOfBirth,
    profession,
    status,
    contacts,
    address,
    personalBusiness,
    bankAccounts,
    notes,
  } = body;

  // Clean and format CPF
  if (cpf) {
    cpf = String(cpf).replace(/[^\d]/g, '');
  }

  return {
    id: null,
    fullName: String(fullName || '').trim(),
    cpf,
    rg: String(rg || '').trim(),
    dateOfBirth,
    profession: String(profession || '').trim(),
    status: status || 'active',
    contacts: contacts || {
      emails: [''],
      phones: [''],
      cellphones: [''],
    },
    address: address || {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      zipCode: '',
      city: '',
      state: '',
      country: 'Brasil',
    },
    personalBusiness: personalBusiness || {
      hasPersonalBusiness: false,
      businessType: '',
      businessCategory: '',
      businessName: '',
      businessDescription: '',
      isFormalized: false,
      mei: '',
      workingHours: '',
      serviceArea: '',
      averageMonthlyRevenue: 0,
      businessNotes: '',
    },
    bankAccounts: bankAccounts || [],
    notes: String(notes || '').trim(),
  };
}
