export function formatDate(date: Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleString();
    case 'iso':
      return date.toISOString();
    default:
      return date.toString();
  }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffInMinutes(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

export function isExpired(expiryDate: Date): boolean {
  return new Date() > expiryDate;
}
