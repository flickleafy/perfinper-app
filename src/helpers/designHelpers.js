// prettier-ignore
export const transactionTypeColor = (type) => {
    if (type === '-') {return 'collection-item brown lighten-5 ';} 
    else {return 'collection-item green lighten-5 ';}
  };
// prettier-ignore
export const transactionTypeColorIcon = (type) => {
    if (type === '-') {return 'brown lighten-3 ';} 
    else {return 'green lighten-3 ';}
  };
// prettier-ignore
export const iconByCategory = (category) => {
    switch (category) {
      case 'Mercado': return 'local_grocery_store'; case 'Receita': return 'attach_money';
      case 'Transporte': return 'directions_car'; case 'Saúde': return 'local_hospital';
      case 'Lazer': return 'directions_bike'; default: return 'adjust';
    }
  };
