/* Idempotent demo data: runs only when the students table is empty. */
import { PrismaClient } from '@prisma/client';
import { currentMonth } from './common/dates';

const prisma = new PrismaClient();

async function main() {
  if ((await prisma.student.count()) > 0) {
    console.log('Students already exist — seed skipped');
    return;
  }

  // Enrolled three months ago so past months also have debtors.
  const enrolled = new Date();
  enrolled.setMonth(enrolled.getMonth() - 3, 1);

  const students = [
    { name: 'Алишер Каримов', phone: '+998 90 111-22-33', group: 'JS-1', monthlyFee: 500000 },
    { name: 'Мария Иванова', phone: '+998 91 222-33-44', group: 'JS-1', monthlyFee: 500000 },
    { name: 'Тимур Рахимов', phone: '+998 93 333-44-55', group: 'Python-2', monthlyFee: 600000 },
    { name: 'Дильноза Юсупова', phone: '+998 94 444-55-66', group: 'Python-2', monthlyFee: 600000 },
    { name: 'Олег Смирнов', phone: '+998 97 555-66-77', group: 'English-A1', monthlyFee: 350000 },
  ];

  const month = currentMonth();
  // Current month: full, partial, partial in two parts, none, full.
  const paymentsThisMonth: number[][] = [[500000], [200000], [300000, 100000], [], [350000]];

  for (const [i, s] of students.entries()) {
    const student = await prisma.student.create({ data: { ...s, createdAt: enrolled } });
    const payments = paymentsThisMonth[i].map((amount, j) => ({
      studentId: student.id,
      amount,
      date: new Date(`${month}-0${j + 1}T00:00:00Z`),
    }));
    if (payments.length) await prisma.payment.createMany({ data: payments });
  }
  console.log(`Seeded ${students.length} students`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
