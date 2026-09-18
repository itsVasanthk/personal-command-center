export const calculateTotal = (numbers: number[]): number => {
  return numbers.reduce((acc, curr) => acc + curr, 0);
};

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return calculateTotal(numbers) / numbers.length;
};

export const calculateMinimum = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.min(...numbers);
};

export const calculateMaximum = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return Math.max(...numbers);
};

export const calculatePercentageChange = (current: number, previous: number): number | null => {
  if (previous === 0) return null; // Handle division by zero / no previous data
  return ((current - previous) / previous) * 100;
};
