import { CategoriesMap } from './categories.map';
import { IncomeButton } from './IncomeButton';
import { TransportButton } from './TransportButton';
import { HealthButton } from './HealthButton';
import { EntertainmentButton } from './EntertainmentButton';
import { GroceryButton } from './GroceryButton';
import { CreditCardButton } from './CreditCardButton';
import { GiftCardButton } from './GiftCardButton';

describe('CategoriesMap', () => {
  it('maps categories to their corresponding buttons', () => {
    expect(CategoriesMap.Mercado).toBe(GroceryButton);
    expect(CategoriesMap.Receita).toBe(IncomeButton);
    expect(CategoriesMap['Sal\u00e1rio']).toBe(IncomeButton);
    expect(CategoriesMap.Beneficios).toBe(GiftCardButton);
    expect(CategoriesMap.Transporte).toBe(TransportButton);
    expect(CategoriesMap['Sa\u00fade']).toBe(HealthButton);
    expect(CategoriesMap.Lazer).toBe(EntertainmentButton);
    expect(CategoriesMap.FaturaCredito).toBe(CreditCardButton);
  });
});
