export const getToday = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

export const getStartOfWeek = (baseDate?: string): string => {
  const date = baseDate ? new Date(baseDate) : new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
};

export const getEndOfWeek = (baseDate?: string): string => {
  const start = new Date(getStartOfWeek(baseDate));
  start.setDate(start.getDate() + 6);
  return start.toISOString().split('T')[0];
};

export const getPreviousWeek = (baseDate: string): string => {
  const date = new Date(getStartOfWeek(baseDate));
  date.setDate(date.getDate() - 7);
  return date.toISOString().split('T')[0];
};

export const getNextWeek = (baseDate: string): string => {
  const date = new Date(getStartOfWeek(baseDate));
  date.setDate(date.getDate() + 7);
  return date.toISOString().split('T')[0];
};

export const getStartOfMonth = (baseDate?: string): string => {
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setDate(1);
  return date.toISOString().split('T')[0];
};

export const getEndOfMonth = (baseDate?: string): string => {
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setMonth(date.getMonth() + 1);
  date.setDate(0);
  return date.toISOString().split('T')[0];
};

export const getPreviousMonth = (baseDate: string): string => {
  const date = new Date(getStartOfMonth(baseDate));
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().split('T')[0];
};

export const getNextMonth = (baseDate: string): string => {
  const date = new Date(getStartOfMonth(baseDate));
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
};

export const getLast90Days = (baseDate?: string): string => {
  const date = baseDate ? new Date(baseDate) : new Date();
  date.setDate(date.getDate() - 90);
  return date.toISOString().split('T')[0];
};

export const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatDateShort = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatMonthYear = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const getDaysInDateRange = (startDate: string, endDate: string): string[] => {
  const days: string[] = [];
  const curr = new Date(startDate);
  const end = new Date(endDate);
  
  while (curr <= end) {
    days.push(curr.toISOString().split('T')[0]);
    curr.setDate(curr.getDate() + 1);
  }
  return days;
};
