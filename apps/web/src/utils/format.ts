export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const formatDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  if (diffDays <= 7) return `há ${diffDays} dias`;

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export const formatShortDate = (isoDate: string): string => {
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const formatPercent = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'decimal',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value) + '%';
