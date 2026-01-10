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
    fiscalBookId,
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
    fiscalBookId,
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

// Fiscal Book builder function - aligned with backend FiscalBookModel
export function fiscalBookBuilder(body) {
  const {
    bookName,
    bookType,
    bookPeriod,
    reference,
    status,
    fiscalData,
    companyId,
    notes,
    createdAt,
    updatedAt,
    closedAt,
    transactionCount,
    totalIncome,
    totalExpenses,
    netAmount,
    // Legacy fields for compatibility
    name,
    description,
    year,
    isActive,
  } = body;

  return {
    id: null,
    bookName: String(bookName || name || '').trim(),
    bookType: bookType || 'Outros',
    bookPeriod: bookPeriod || (year ? year.toString() : new Date().getFullYear().toString()),
    reference: String(reference || '').trim(),
    status: determineStatus(status, isActive),
    fiscalData: buildFiscalData(fiscalData, bookPeriod, year),
    companyId: companyId || null,
    notes: String(notes || description || '').trim(),
    createdAt: createdAt || new Date().toISOString(),
    updatedAt: updatedAt || new Date().toISOString(),
    closedAt: closedAt || null,
    // Virtual fields
    transactionCount: Number(transactionCount) || 0,
    totalIncome: Number(totalIncome) || 0,
    totalExpenses: Number(totalExpenses) || 0,
    netAmount: Number(netAmount) || 0,
  };
}

// Helper function to determine status
function determineStatus(status, isActive) {
  if (status) return status;
  if (isActive !== undefined) return isActive ? 'Aberto' : 'Arquivado';
  return 'Aberto';
}

// Helper function to build fiscal data
function buildFiscalData(fiscalData, bookPeriod, year) {
  const defaultFiscalData = {
    taxAuthority: '',
    fiscalYear: extractFiscalYear(bookPeriod, year),
    fiscalPeriod: determineFiscalPeriod(bookPeriod),
    taxRegime: 'Simples Nacional',
    submissionDate: null,
    dueDate: null,
  };

  if (!fiscalData || typeof fiscalData !== 'object') {
    return defaultFiscalData;
  }

  return {
    taxAuthority: String(fiscalData.taxAuthority || '').trim(),
    fiscalYear: Number(fiscalData.fiscalYear) || defaultFiscalData.fiscalYear,
    fiscalPeriod: fiscalData.fiscalPeriod || defaultFiscalData.fiscalPeriod,
    taxRegime: fiscalData.taxRegime || defaultFiscalData.taxRegime,
    submissionDate: fiscalData.submissionDate || null,
    dueDate: fiscalData.dueDate || null,
  };
}

// Helper function to extract fiscal year
function extractFiscalYear(bookPeriod, year) {
  if (bookPeriod) return parseInt(bookPeriod.split('-')[0], 10);
  if (year) return Number(year);
  return new Date().getFullYear();
}

// Helper function to determine fiscal period
function determineFiscalPeriod(bookPeriod) {
  return bookPeriod && bookPeriod.includes('-') ? 'monthly' : 'annual';
}

// Build fiscal book for creation
export function buildFiscalBookForCreation(formData) {
  const fiscalBookData = fiscalBookBuilder(formData);
  return {
    ...fiscalBookData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Build fiscal book for editing
export function buildFiscalBookForEdit(existingFiscalBook, formData) {
  const updatedData = fiscalBookBuilder(formData);

  return {
    ...updatedData,
    _id: existingFiscalBook._id,
    createdAt: existingFiscalBook.createdAt, // Preserve original creation date
    updatedAt: new Date().toISOString(),
  };
}

// Build fiscal book from API response
export function buildFiscalBookFromResponse(apiResponse) {
  return {
    _id: apiResponse._id,
    bookName: apiResponse.bookName || '',
    bookType: apiResponse.bookType || 'Outros',
    bookPeriod: apiResponse.bookPeriod || new Date().getFullYear().toString(),
    reference: apiResponse.reference || '',
    status: apiResponse.status || 'Aberto',
    fiscalData: apiResponse.fiscalData || {
      taxAuthority: '',
      fiscalYear: new Date().getFullYear(),
      fiscalPeriod: 'annual',
      taxRegime: 'Simples Nacional',
      submissionDate: null,
      dueDate: null,
    },
    companyId: apiResponse.companyId || null,
    notes: apiResponse.notes || '',
    createdAt: apiResponse.createdAt,
    updatedAt: apiResponse.updatedAt,
    closedAt: apiResponse.closedAt || null,
    transactionCount: apiResponse.transactionCount || 0,
    totalIncome: apiResponse.totalIncome || 0,
    totalExpenses: apiResponse.totalExpenses || 0,
    netAmount: apiResponse.netAmount || 0,
    // Add legacy fields for compatibility
    year: extractFiscalYear(apiResponse.bookPeriod, apiResponse.year),
    name: apiResponse.bookName || apiResponse.name || '',
    description: apiResponse.notes || apiResponse.description || '',
    isActive: apiResponse.status === 'Aberto' || apiResponse.isActive === true,
  };
}
