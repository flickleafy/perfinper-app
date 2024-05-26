export function buildDateObj(data) {
  const { year, month, day } = data;
  let date = new Date(year, month - 1, day);
  return date;
}
