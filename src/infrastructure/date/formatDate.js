export function formatDate(date) {
  // Step 1: Get the current timezone of the computer
  const currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Step 2: Assume you have a UTC time you want to format
  const utcDate = new Date(date);

  // Step 3: Format this UTC date to the current timezone
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    month: '2-digit',
    day: '2-digit',
    timeZone: currentTimezone,
  }).format(utcDate);
  return formattedDate;
}
