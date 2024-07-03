import { IncomeButton } from './IncomeButton';
import { TransportButton } from './TransportButton';
import { HealthButton } from './HealthButton';
import { EntertainmentButton } from './EntertainmentButton';
import { GroceryButton } from './GroceryButton';

export const CategoriesMap = {
  Mercado: GroceryButton,
  Receita: IncomeButton,
  Salário: IncomeButton,
  Transporte: TransportButton,
  Saúde: HealthButton,
  Lazer: EntertainmentButton,
};
