import { Prisma } from '@prisma/client';

/** Prisma returns NUMERIC as Decimal; the API exposes plain numbers (2 decimal places). */
export function toMoney(value: Prisma.Decimal | number | string | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Math.round(Number(value) * 100) / 100;
}
