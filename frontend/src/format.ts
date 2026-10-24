const money = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

export const formatMoney = (value: number) => money.format(value);

const pad = (n: number) => String(n).padStart(2, '0');

export function todayIso(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const currentMonth = () => todayIso().slice(0, 7);

export function formatMonth(month: string) {
  const [y, m] = month.split('-').map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export const formatDate = (iso: string) => new Date(`${iso}T00:00:00`).toLocaleDateString('ru-RU');
