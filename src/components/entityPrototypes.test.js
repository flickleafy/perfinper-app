import { companyPrototype, personPrototype } from './entityPrototypes';

describe('entityPrototypes', () => {
  it('builds a company prototype with defaults', () => {
    const company = companyPrototype();

    expect(company).toEqual(
      expect.objectContaining({
        id: null,
        companyName: '',
        companyCnpj: '',
        status: 'Ativa',
        contacts: expect.objectContaining({
          email: '',
          phones: [''],
          website: '',
          socialMedia: [],
        }),
        address: expect.objectContaining({
          country: 'Brasil',
        }),
        activities: expect.objectContaining({
          primary: expect.objectContaining({
            code: '',
            description: '',
          }),
          secondary: [],
        }),
      })
    );
  });

  it('builds a person prototype with defaults', () => {
    const person = personPrototype();

    expect(person).toEqual(
      expect.objectContaining({
        id: null,
        fullName: '',
        cpf: '',
        status: 'active',
        contacts: expect.objectContaining({
          emails: [''],
          phones: [''],
          cellphones: [''],
        }),
        address: expect.objectContaining({
          country: 'Brasil',
        }),
        personalBusiness: expect.objectContaining({
          hasPersonalBusiness: false,
          businessType: '',
        }),
      })
    );
  });
});
