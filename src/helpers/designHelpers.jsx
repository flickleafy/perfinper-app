export const transactionTypeColor = (type, primary, secundary) => {
  if (type === '-') {
    return primary;
  }
  return secundary;
};
