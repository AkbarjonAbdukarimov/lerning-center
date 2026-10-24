import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { monthRange } from '../common/dates';
import { toMoney } from '../common/money';
import { PrismaService } from '../prisma/prisma.service';

export interface DebtorRow {
  id: number;
  name: string;
  phone: string;
  group: string;
  monthlyFee: Prisma.Decimal;
  paid: Prisma.Decimal;
}

export function toDebtorsReport(month: string, rows: DebtorRow[]) {
  const debtors = rows.map((r) => {
    const monthlyFee = toMoney(r.monthlyFee);
    const paid = toMoney(r.paid);
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      group: r.group,
      monthlyFee,
      paid,
      debt: toMoney(monthlyFee - paid),
    };
  });
  const totalDebt = toMoney(debtors.reduce((sum, d) => sum + d.debt, 0));
  return { month, count: debtors.length, totalDebt, debtors };
}

@Injectable()
export class DebtorsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Students who paid less than their monthly fee within the given month.
   * Students enrolled (created) after the month ended are not counted.
   */
  async findDebtors(month: string) {
    const { start, end } = monthRange(month);
    const rows = await this.prisma.$queryRaw<DebtorRow[]>`
      SELECT s.id, s.name, s.phone, s."group",
             s.monthly_fee AS "monthlyFee",
             COALESCE(SUM(p.amount), 0) AS paid
      FROM students s
      LEFT JOIN payments p
        ON p.student_id = s.id
       AND p.date >= ${start}::date
       AND p.date <  ${end}::date
      WHERE s.created_at < ${end}::timestamp
      GROUP BY s.id
      HAVING COALESCE(SUM(p.amount), 0) < s.monthly_fee
      ORDER BY s.monthly_fee - COALESCE(SUM(p.amount), 0) DESC, s.name ASC
    `;
    return toDebtorsReport(month, rows);
  }
}
