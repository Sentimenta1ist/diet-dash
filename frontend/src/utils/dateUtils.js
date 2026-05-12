export function formatDate(input) {
  if (!input) return null;

  // if it is "YYYY-MM-DD", just return
  if (typeof input === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date)) {
    throw new Error(`Invalid date passed to formatDate: ${input}`);
  }

  const pad = (num) => num.toString().padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function getNextDay(date) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1);
  return newDate;
}