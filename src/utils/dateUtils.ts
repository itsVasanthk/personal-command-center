export const getToday = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const getStartOfWeek = (): string => {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
};

export const getEndOfWeek = (): string => {
  const start = new Date(getStartOfWeek());
  start.setDate(start.getDate() + 6);
  return start.toISOString().split('T')[0];
};

export const getStartOfMonth = (): string => {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
};

export const getEndOfMonth = (): string => {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.toISOString().split('T')[0];
};

export const getLast90Days = (): string => {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().split('T')[0];
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};
