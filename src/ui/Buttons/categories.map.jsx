import { IncomeButton } from './IncomeButton';
import { TransportButton } from './TransportButton';
import { HealthButton } from './HealthButton';
import { EntertainmentButton } from './EntertainmentButton';
import { GroceryButton } from './GroceryButton';
import { CreditCardButton } from './CreditCardButton';
import { GiftCardButton } from './GiftCardButton';

export const CategoriesMap = {
  Mercado: GroceryButton,
  Receita: IncomeButton,
  Salário: IncomeButton,
  Beneficios: GiftCardButton,
  Transporte: TransportButton,
  Saúde: HealthButton,
  Lazer: EntertainmentButton,
  FaturaCredito: CreditCardButton,
};
