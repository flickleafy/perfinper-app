export function csvToJson(csvData) {
  const lines = csvData.split('\n');
  const header = lines[0].split(',');
  const transactions = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const transaction = {};
    for (let j = 0; j < header.length; j++) {
      transaction[header[j]] = values[j];
    }
    transactions.push(transaction);
  }
  return transactions;
}
