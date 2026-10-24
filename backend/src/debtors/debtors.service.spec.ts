import { Prisma } from '@prisma/client';
import { currentMonth, isValidIsoDate, monthRange } from '../common/dates';
import { toDebtorsReport } from './debtors.service';

describe('monthRange', () => {
  it('returns a half-open range for a regular month', () => {
    expect(monthRange('2025-03')).toEqual({ start: '2025-03-01', end: '2025-04-01' });
  });

  it('rolls December over to the next year', () => {
    expect(monthRange('2024-12')).toEqual({ start: '2024-12-01', end: '2025-01-01' });
  });

  it.each(['2024-13', '2024-00', '2024-1', 'abc', ''])('rejects invalid month %p', (m) => {
    expect(() => monthRange(m)).toThrow();
  });
});

describe('dates', () => {
  it('formats current month as YYYY-MM', () => {
    expect(currentMonth(new Date(2025, 0, 31))).toBe('2025-01');
  });

  it('validates real calendar dates', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('2025-02-29')).toBe(false);
    expect(isValidIsoDate('2025-04-31')).toBe(false);
  });
});

describe('toDebtorsReport', () => {
  it('computes debt per student and total', () => {
    const report = toDebtorsReport('2025-01', [
      { id: 1, name: 'A', phone: '1', group: 'G', monthlyFee: new Prisma.Decimal('1000.00'), paid: new Prisma.Decimal('400.50') },
      { id: 2, name: 'B', phone: '2', group: 'G', monthlyFee: new Prisma.Decimal('500'), paid: new Prisma.Decimal(0) },
    ]);
    expect(report.count).toBe(2);
    expect(report.debtors[0]).toMatchObject({ monthlyFee: 1000, paid: 400.5, debt: 599.5 });
    expect(report.debtors[1]).toMatchObject({ paid: 0, debt: 500 });
    expect(report.totalDebt).toBe(1099.5);
  });
});
