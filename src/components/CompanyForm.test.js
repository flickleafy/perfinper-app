import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import CompanyForm from './CompanyForm';

jest.mock('@mui/x-date-pickers/LocalizationProvider', () => ({
  LocalizationProvider: ({ children }) => <div>{children}</div>,
}));

jest.mock('@mui/x-date-pickers/DatePicker', () => ({
  DatePicker: ({ label, onChange, value }) => (
    <input
      aria-label={label}
      value={value || ''}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

describe('CompanyForm', () => {
  const baseCompany = {
    companyName: '',
    companyCnpj: '',
    contacts: {
      phones: [''],
      socialMedia: [],
    },
    activities: {
      secondary: [],
    },
    corporateStructure: [],
  };

  it('updates contacts when phones change', async () => {
    const handleContactsChange = jest.fn();

    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleContactsChange={handleContactsChange}
      />
    );

    handleContactsChange.mockClear();

    fireEvent.click(screen.getByText('Contatos'));

    fireEvent.change(screen.getByLabelText('Telefone 1'), {
      target: { value: '9999' },
    });

    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          phones: ['9999'],
        })
      );
    });

    const phonesSection = screen.getByText('Telefones').closest('div');
    const addButton = phonesSection.querySelector('button');
    fireEvent.click(addButton);

    expect(screen.getByLabelText('Telefone 2')).toBeInTheDocument();

    const socialSection = screen.getByText('Redes Sociais').closest('div');
    fireEvent.click(socialSection.querySelector('button'));

    fireEvent.change(screen.getByLabelText('Handle/Username'), {
      target: { value: 'perfil' },
    });

    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          socialMedia: [expect.objectContaining({ handle: 'perfil' })],
        })
      );
    });
  });

  it('handles checkbox changes via handleInputChange', () => {
    const handleInputChange = jest.fn();

    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={handleInputChange}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /MEI/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /Simples Nacional/i }));

    expect(handleInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'microEntrepreneurOption',
          value: true,
        }),
      })
    );
    expect(handleInputChange).toHaveBeenCalledWith(
      expect.objectContaining({
        target: expect.objectContaining({
          name: 'simplifiedTaxOption',
          value: true,
        }),
      })
    );
  });

  it('passes date changes to handleDateChange', () => {
    const handleDateChange = jest.fn();

    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={() => {}}
        handleDateChange={handleDateChange}
      />
    );

    fireEvent.change(screen.getByLabelText('Data de Funda\u00e7\u00e3o'), {
      target: { value: '2024-01-01' },
    });

    expect(handleDateChange).toHaveBeenCalledWith('foundationDate', '2024-01-01');
  });

  it('updates activities and corporate structure', async () => {
    const handleActivitiesChange = jest.fn();
    const handleCorporateStructureChange = jest.fn();

    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleActivitiesChange={handleActivitiesChange}
        handleCorporateStructureChange={handleCorporateStructureChange}
      />
    );

    handleActivitiesChange.mockClear();
    handleCorporateStructureChange.mockClear();

    fireEvent.click(screen.getByText('Atividades'));
    const activitiesSection = screen.getByText('Atividades Secund\u00e1rias').closest('div');
    fireEvent.click(activitiesSection.querySelector('button'));

    fireEvent.change(screen.getByLabelText('Descri\u00e7\u00e3o da Atividade 1'), {
      target: { value: 'Servico' },
    });

    await waitFor(() => {
      expect(handleActivitiesChange).toHaveBeenCalledWith(
        expect.objectContaining({
          secondary: [expect.objectContaining({ description: 'Servico' })],
        })
      );
    });

    fireEvent.click(screen.getByText('Estrutura Societ\u00e1ria'));
    const partnersSection = screen.getByText('S\u00f3cios').closest('div');
    fireEvent.click(partnersSection.querySelector('button'));

    fireEvent.change(screen.getByLabelText('Nome do S\u00f3cio'), {
      target: { value: 'Alice' },
    });

    await waitFor(() => {
      expect(handleCorporateStructureChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ name: 'Alice' })])
      );
    });
  });

  it('manages phones and social media correctly', async () => {
    const handleContactsChange = jest.fn();
    const initialCompany = {
      ...baseCompany,
      contacts: {
        phones: ['123', '456'],
        socialMedia: [{ platform: 'Twitter', handle: 'handle1', url: 'url1', isActive: true }],
      },
    };

    render(
      <CompanyForm
        formTitle="Company"
        company={initialCompany}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleContactsChange={handleContactsChange}
      />
    );

    // Expand Contatos section
    fireEvent.click(screen.getByText('Contatos'));

    // Test removing a phone
    // Find input
    const phoneInput = screen.getByLabelText('Telefone 1'); 
    // Structure: Box > TextField + IconButton
    // phoneInput -> InputBase -> FormControl -> Box
    // Traversing up 3 levels from input gives FormControl.
    // Box is parent of FormControl.
    const phoneRow = phoneInput.closest('.MuiFormControl-root').parentElement;
    const deletePhoneBtn = phoneRow.querySelector('button');
    fireEvent.click(deletePhoneBtn);

    expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({
      phones: ['456']
    }));

    // Test social media remove
    const socialInput = screen.getByLabelText('Handle/Username');
    // Traverse to container box
    // input -> InputBase -> FormControl -> GridItem -> GridContainer -> Box
    const socialGridItem = socialInput.closest('.MuiGrid-item'); // Grid item container
    const socialGridContainer = socialGridItem.parentElement; // Grid container
    const socialBox = socialGridContainer.parentElement; // Box container
    const deleteSocialBtn = socialBox.querySelector('button'); // Delete button inside Box
    
    // Check if we found it
    expect(deleteSocialBtn).toBeInTheDocument();
    fireEvent.click(deleteSocialBtn);
    
    expect(handleContactsChange).toHaveBeenCalledWith(expect.objectContaining({
      socialMedia: []
    }));
  });

  it('manages secondary activities correctly', async () => {
    const handleActivitiesChange = jest.fn();
    
    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleActivitiesChange={handleActivitiesChange}
        handleCorporateStructureChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Atividades'));

    // Add secondary activity
    const sectionTitle = screen.getByText('Atividades Secundárias');
    // Button is sibling of "Atividades Secundárias"
    const addBtn = sectionTitle.parentElement.querySelector('button');
    fireEvent.click(addBtn);

    // Verify inputs appear
    const descInput = screen.getByLabelText('Descrição da Atividade 1');
    const codeInput = screen.getByLabelText('Código da Atividade 1');

    fireEvent.change(descInput, { target: { value: 'Desc 1' } });
    fireEvent.change(codeInput, { target: { value: 'Code 1' } });

    expect(handleActivitiesChange).toHaveBeenCalledWith(expect.objectContaining({
      secondary: [expect.objectContaining({ description: 'Desc 1', code: 'Code 1' })]
    }));

    // Remove secondary activity
    // Box > TextField + TextField + IconButton
    // descInput -> FormControl -> Box
    const row = descInput.closest('.MuiFormControl-root').parentElement;
    const removeBtn = row.querySelector('button');
    fireEvent.click(removeBtn);

    expect(handleActivitiesChange).toHaveBeenCalledWith(expect.objectContaining({
      secondary: []
    }));
  });

  it('manages corporate structure correctly', async () => {
    const handleCorporateStructureChange = jest.fn();
    
    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleActivitiesChange={() => {}}
        handleCorporateStructureChange={handleCorporateStructureChange}
      />
    );

    fireEvent.click(screen.getByText('Estrutura Societária'));

    // Add partner
    const sectionTitle = screen.getByText('Sócios');
    const addBtn = sectionTitle.parentElement.querySelector('button');
    fireEvent.click(addBtn);

    // Fill partner details
    const nameInput = screen.getByLabelText('Nome do Sócio');
    fireEvent.change(nameInput, { target: { value: 'Partner A' } });
    
    // Change Type Select
    // Use mouseDown on the select trigger
    // Since we can't rely on label association easily for Select sometimes, we look for the button-like div
    // We can assume it is the sibling of the label "Tipo" in the FormControl
    // Or we look for role="button" (MUI v5 Select) that is NOT the add or delete button.
    // There are add/delete buttons nearby, so be careful.
    // The Select is inside a FormControl.
    // <FormControl><InputLabel>Tipo</InputLabel><Select.../></FormControl>
    // We can find the InputLabel by text 'Tipo'
    // But InputLabel is not the trigger. The Select (next sibling) is.
    // Let's find the select trigger by finding the role button/combobox within the same FormControl as the label.
    // But testing library queries are user-centric.
    // Let's try `screen.getByRole('button', { name: 'Tipo' })` again. If label is linked, it works.
    // If not, we might need `dummy` approach.
    
    // Alternative: The Select likely has an input[type=hidden] with name if provided? But here we don't name the Select?
    // Oh, <Select value={...} label="Tipo">
    
    // Let's try locating by test id if I added it? No.
    
    // Let's try fixing the test by finding the box containing the partner inputs, then finding the select inside it.
    // Partner Box -> Grid (container) -> Grid (item 2) -> FormControl -> Select
    const partnerNameInput = screen.getByLabelText('Nome do Sócio');
    // Go up to Grid Container (contains all 4 inputs/grids)
    // input -> InputBase -> FormControl -> GridItem -> GridContainer
    const gridContainer = partnerNameInput.closest('.MuiGrid-container');
    // The Select is in the 2nd textual child, or we can query inside this container
    const selectTrigger = gridContainer.querySelector('[role="button"], [role="combobox"]');
    // Select is usually the only combobox/select-button in this partner row.
    fireEvent.mouseDown(selectTrigger);

    const option = screen.getByText('Administrador');
    fireEvent.click(option);

    expect(handleCorporateStructureChange).toHaveBeenCalledWith([
      expect.objectContaining({ name: 'Partner A', type: 'Administrador' })
    ]);

    // Remove partner
    // Button is outside the Grid container, in the partner Box
    const partnerBox = gridContainer.closest('.MuiBox-root');
    const deleteBtn = partnerBox.querySelector('button[type="button"]:not([role="combobox"])'); 
    // Wait, IconButton is type="button". Select might be too.
    // The delete button has an icon inside (DeleteIcon).
    // The select usually has ExpandMore or Arrow.
    // Let's find button with Delete icon.
    const allDeleteIcons = screen.getAllByTestId('DeleteIcon');
    // The last one should be ours (open section).
    const deleteBtnByIcon = allDeleteIcons[allDeleteIcons.length - 1].closest('button');
    
    fireEvent.click(deleteBtnByIcon);

    expect(handleCorporateStructureChange).toHaveBeenLastCalledWith([]);
  });

  it('renders statistics correctly', () => {
    const statsCompany = {
      ...baseCompany,
      statistics: {
        totalTransactions: 10,
        totalTransactionValue: 'R$ 1.000,00',
        lastTransaction: '2024-01-01T10:00:00Z'
      }
    };

    render(
      <CompanyForm
        formTitle="Company"
        company={statsCompany}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Estatísticas'));

    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('R$ 1.000,00')).toBeInTheDocument();
    // Helper formats date
    expect(screen.getByDisplayValue(/\d{2}\/\d{2}\/\d{4}/)).toBeInTheDocument();
  });

  it('updates address fields', () => {
    let capturedEvent = null;
    const handleInputChange = jest.fn((e) => {
      capturedEvent = {
        target: {
          name: e.target.name,
          value: e.target.value
        }
      };
    });

    render(
      <CompanyForm
        formTitle="Company"
        company={baseCompany}
        handleInputChange={handleInputChange}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Endereço'));

    const streetInput = screen.getByLabelText('Logradouro');
    fireEvent.change(streetInput, {
      target: { value: 'Rua Teste', name: 'address.street' },
    });

    expect(handleInputChange).toHaveBeenCalled();
    expect(capturedEvent.target.name).toBe('address.street');
    expect(capturedEvent.target.value).toBe('Rua Teste');
  });

  it('removes phone number', async () => {
    const handleContactsChange = jest.fn();
    const company = {
      ...baseCompany,
      contacts: {
        phones: ['123', '456'],
        socialMedia: [],
      },
    };

    render(
      <CompanyForm
        formTitle="Company"
        company={company}
        handleContactsChange={handleContactsChange}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Contatos'));

    // Find the input for the first phone '123'
    const phoneInput = screen.getByDisplayValue('123');
    // Traverse up to Box. TextField is nested. Box has class MuiBox-root
    const phoneBox = phoneInput.closest('.MuiBox-root');
    // Find the removal button within this box
    const removeButton = phoneBox.querySelector('button');
    
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          phones: ['456'],
        })
      );
    });
  });

  it('removes social media entry', async () => {
    const handleContactsChange = jest.fn();
    const company = {
      ...baseCompany,
      contacts: {
        phones: [],
        socialMedia: [
          { platform: 'Twitter', handle: 'handle1', url: 'url1', isActive: true },
        ],
      },
    };

    render(
      <CompanyForm
        formTitle="Company"
        company={company}
        handleContactsChange={handleContactsChange}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Contatos'));

    const handleField = screen.getByDisplayValue('handle1');
    // Go up to the container that has the delete button. 
    // Field is in Grid item -> Grid container -> Box.
    // Closest MuiBox-root should be the container.
    const itemContainer = handleField.closest('.MuiBox-root');
    const deleteBtn = itemContainer.querySelector('button');
    
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          socialMedia: [],
        })
      );
    });
  });

  it('updates and removes corporate structure entries', async () => {
    const handleCorporateStructureChange = jest.fn();
    
    render(
      <CompanyForm
        formTitle="Company"
        company={{...baseCompany, corporateStructure: [{ name: 'Socio 1', type: 'Sócio', cnpj: '', country: '' }]}}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleCorporateStructureChange={handleCorporateStructureChange}
      />
    );

    fireEvent.click(screen.getByText('Estrutura Societária'));

    // Test updating CNPJ
    fireEvent.change(screen.getByLabelText('CNPJ/CPF do Sócio'), {
      target: { value: '12345' },
    });

    await waitFor(() => {
      expect(handleCorporateStructureChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ cnpj: '12345' })])
      );
    });

     // Remove entry
    const nameInput = screen.getByDisplayValue('Socio 1');
    const partnerBox = nameInput.closest('.MuiBox-root');
    const deleteButton = partnerBox.querySelector('button');

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(handleCorporateStructureChange).toHaveBeenCalledWith([]);
    });
  });

  it('removes phone number', async () => {
    const handleContactsChange = jest.fn();
    const company = {
      ...baseCompany,
      contacts: {
        phones: ['123', '456'],
        socialMedia: [],
      },
    };

    render(
      <CompanyForm
        formTitle="Company"
        company={company}
        handleContactsChange={handleContactsChange}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Contatos'));

    // Find the input for the first phone '123'
    const phoneInput = screen.getByDisplayValue('123');
    // The structure is Box -> [TextField, IconButton]
    // Traverse up to Box
    const phoneBox = phoneInput.closest('.MuiBox-root');
    // Find the removal button within this box
    const removeButton = phoneBox.querySelector('button');
    
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          phones: ['456'],
        })
      );
    });
  });

  it('removes social media entry', async () => {
    const handleContactsChange = jest.fn();
    const company = {
      ...baseCompany,
      contacts: {
        phones: [],
        socialMedia: [
          { platform: 'Twitter', handle: 'handle1', url: 'url1', isActive: true },
        ],
      },
    };

    render(
      <CompanyForm
        formTitle="Company"
        company={company}
        handleContactsChange={handleContactsChange}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
      />
    );

    fireEvent.click(screen.getByText('Contatos'));

    // Find the handle input
    const handleInput = screen.getByDisplayValue('handle1');
    // Walk up to the main social media container box
    // Structure: Box -> [Grid container, IconButton (Delete)]
    // The input is deep inside Grid -> Grid Item -> TextField -> InputBase -> input
    // We need to go up enough levels.
    // Box (social media item)
    //   Grid container
    //     Grid item
    //       TextField
    //         ... input
    //   IconButton
    
    let container = handleInput;
    while (container && !container.classList.contains('MuiBox-root')) {
      container = container.parentElement;
    }
    // Now we might be at a Box that is not the main one (mui components use boxes internally)
    // The loop above stops at the first Box. 
    // The social media box has `border: '1px dashed grey'`. We can look for that or just look for the button in a wider scope relative to the input.
    // Actually, finding the button by role within a gathered list of buttons is safer if we know the order, but let's try finding the delete button relative to the text.
    
    // Alternative: Get all delete buttons in the social media section? 
    // The social media section starts after "Redes Sociais".
    
    // Let's stick to the previous implementation which passed? 
    // Wait, the previous run says: "✓ removes social media entry (146 ms)". It PASSED!
    // So I only need to fix the other two failing tests.
    
    // But I will keep the previous implementation for social media if it worked, or rewrite similarly if I am replacing the block.
    // I am replacing the entire block I added, so I will just copy the successful logic if possible, or improve it.
    // The previous logic was:
    // const socialBox = screen.getByLabelText('Handle/Username').closest('.MuiBox-root');
    // const buttons = socialBox.querySelectorAll('button');
    // const deleteButton = buttons[buttons.length - 1]; 
    
    // I will reuse this logic but make sure I select the right 'Handle/Username'.
    
    const socialBox = screen.getByDisplayValue('handle1').closest('.MuiBox-root').parentElement.closest('.MuiBox-root'); 
    // Note: .closest('.MuiBox-root') on input finds the input wrapper?
    // Let's just start from a known text and traverse down.
    
    const socialMediaSectionHeader = screen.getByText('Redes Sociais');
    // The Box containing the item is adjacent or nearby.
    // Let's use the 'handle1' value to be precise.
    const handleField = screen.getByDisplayValue('handle1');
    const itemBox = handleField.closest('.MuiBox-root');
    const deleteBtn = within(itemBox).getByRole('button');

    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          socialMedia: [],
        })
      );
    });
  });

  it('updates and removes corporate structure entries', async () => {
    const handleCorporateStructureChange = jest.fn();
    
    render(
      <CompanyForm
        formTitle="Company"
        company={{...baseCompany, corporateStructure: [{ name: 'Socio 1', type: 'Sócio', cnpj: '', country: '' }]}}
        handleInputChange={() => {}}
        handleDateChange={() => {}}
        handleCorporateStructureChange={handleCorporateStructureChange}
      />
    );

    fireEvent.click(screen.getByText('Estrutura Societária'));

    // Test updating CNPJ
    fireEvent.change(screen.getByLabelText('CNPJ/CPF do Sócio'), {
      target: { value: '12345' },
    });

    await waitFor(() => {
      expect(handleCorporateStructureChange).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ cnpj: '12345' })])
      );
    });

     // Remove entry
    const nameInput = screen.getByDisplayValue('Socio 1');
    const partnerBox = nameInput.closest('.MuiBox-root');
    const deleteButton = within(partnerBox).getByRole('button');

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(handleCorporateStructureChange).toHaveBeenCalledWith([]);
    });
  });

  it('covers missing branches (status date, checkboxes, social platform select, full corp structure)', async () => {
    const handleInputChange = jest.fn();
    const handleDateChange = jest.fn();
    const handleContactsChange = jest.fn();
    const handleCorporateStructureChange = jest.fn();
    const handleActivitiesChange = jest.fn();
    
    render(
      <CompanyForm
        formTitle="Company"
        company={{
          ...baseCompany,
          contacts: {
            ...baseCompany.contacts,
            socialMedia: [{ platform: 'Facebook', handle: 'handle1', url: 'url1', isActive: true }]
          },
          corporateStructure: [{ name: 'Socio 1', type: 'Sócio', cnpj: '', country: '' }]
        }}
        handleInputChange={handleInputChange}
        handleDateChange={handleDateChange}
        handleContactsChange={handleContactsChange}
        handleCorporateStructureChange={handleCorporateStructureChange}
        handleActivitiesChange={handleActivitiesChange}
      />
    );

    // 1. Data da Situação Cadastral (DatePicker)
    // Note: The actual label might differ slightly in DOM
    const statusDateInput = screen.getByLabelText(/Data da Situação Cadastral/i);
    fireEvent.change(statusDateInput, { target: { value: '01/01/2023' } });
    await waitFor(() => {
      // Expect the date object or formatted string depending on implementation
      // The implementation uses handleDateChange('statusDate', date)
      // Since our mock passes the string directly as 'date'
      expect(handleDateChange).toHaveBeenCalledWith('statusDate', '01/01/2023');
    });

    // 2. Opção MEI (Checkbox)
    const meiCheckbox = screen.getByLabelText(/Opção MEI/i);
    fireEvent.click(meiCheckbox);
    await waitFor(() => {
        expect(handleInputChange).toHaveBeenCalledWith(expect.objectContaining({
            target: { name: 'microEntrepreneurOption', value: true }
        }));
    });

    // 3. Simples Nacional (Checkbox)
    const simplesCheckbox = screen.getByLabelText(/Simples Nacional/i);
    fireEvent.click(simplesCheckbox);
    await waitFor(() => {
         expect(handleInputChange).toHaveBeenCalledWith(expect.objectContaining({
            target: { name: 'simplifiedTaxOption', value: true }
        }));
    });

    // 4. Social Media Platform (Select)
    fireEvent.click(screen.getByText('Contatos')); 
    
    // MUI Select often behaves as a combobox or button. 
    // Best way when using simple Select is finding the input or the button role.
    // We added a testId to make it robust.
    const platformSelectContainer = screen.getByTestId('social-platform-select-0');
    // Inside the Select component container, the trigger is a div with role button/combobox
    const platformTrigger = within(platformSelectContainer).getByRole('combobox');
    
    fireEvent.mouseDown(platformTrigger);
    
    // Check if menu opened
    const listbox = within(screen.getByRole('presentation')).getByRole('listbox');
    fireEvent.click(within(listbox).getByText('Instagram'));
    
    await waitFor(() => {
      expect(handleContactsChange).toHaveBeenCalledWith(
        expect.objectContaining({
          socialMedia: expect.arrayContaining([
            expect.objectContaining({ platform: 'Instagram' })
          ])
        })
      );
    });

    // 5. Social Media Handle/URL/Active
    fireEvent.change(screen.getByLabelText(/Handle\/Username/i), { target: { value: 'newhandle' } });
    fireEvent.change(screen.getByLabelText(/URL/i), { target: { value: 'http://newurl.com' } });
    fireEvent.click(screen.getByLabelText(/Ativo/i));

    await waitFor(() => {
        expect(handleContactsChange).toHaveBeenCalledWith(
            expect.objectContaining({
                socialMedia: expect.arrayContaining([
                    expect.objectContaining({ handle: 'newhandle', url: 'http://newurl.com', isActive: false })
                ])
            })
        );
    });


    // 6. Corporate Structure Fields
    fireEvent.click(screen.getByText('Estrutura Societária'));
    
    // Name
    fireEvent.change(screen.getByLabelText(/Nome do Sócio/i), { target: { value: 'Socio Updated' } });
    
    // Country
    fireEvent.change(screen.getByLabelText(/País de Origem/i), { target: { value: 'Brasil' } });

    // Type (Select)
    // There are multiple inputs with label "Tipo" (one for company type, one for partner type).
    // We expanded "Estrutura Societária", so we need to target the one inside that accordion section.
    // The structure: Accordion > AccordionDetails > Box (mapped item) > Grid > Grid.
    
    // Type (Select)
    const typeSelectContainer = screen.getByTestId('partner-type-select-0');
    const typeSelect = within(typeSelectContainer).getByRole('combobox');
    fireEvent.mouseDown(typeSelect);
    const typeListbox = within(screen.getByRole('presentation')).getByRole('listbox');
    fireEvent.click(within(typeListbox).getByText('Administrador'));

    await waitFor(() => {
        expect(handleCorporateStructureChange).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ 
                    name: 'Socio Updated', 
                    country: 'Brasil', 
                    type: 'Administrador' 
                })
            ])
        );
    });

  });
});
