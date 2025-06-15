export function companyPrototype() {
  return {
    id: null,
    companyName: '',
    companyCnpj: '',
    corporateName: '',
    tradeName: '',
    foundationDate: null,
    companySize: '',
    legalNature: '',
    microEntrepreneurOption: false,
    simplifiedTaxOption: false,
    shareCapital: '',
    companyType: '',
    status: 'Ativa',
    statusDate: null,
    contacts: {
      email: '',
      phones: [''],
      website: '',
      socialMedia: [],
    },
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      zipCode: '',
      city: '',
      state: '',
      country: 'Brasil',
    },
    activities: {
      primary: {
        code: '',
        description: '',
      },
      secondary: [],
    },
    corporateStructure: [],
    statistics: {
      totalTransactions: 0,
      totalTransactionValue: '0',
      lastTransaction: null,
    },
  };
}

export function personPrototype() {
  return {
    id: null,
    fullName: '',
    cpf: '',
    rg: '',
    dateOfBirth: null,
    profession: '',
    status: 'active',
    contacts: {
      emails: [''],
      phones: [''],
      cellphones: [''],
    },
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      zipCode: '',
      city: '',
      state: '',
      country: 'Brasil',
    },
    personalBusiness: {
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
    bankAccounts: [],
    notes: '',
  };
}
