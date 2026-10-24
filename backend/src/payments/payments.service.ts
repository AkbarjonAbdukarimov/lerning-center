import { Injectable } from '@nestjs/common';
import { Payment } from '@prisma/client';
import { dateToIso, todayIso } from '../common/dates';
import { toMoney } from '../common/money';
import { PrismaService } from '../prisma/prisma.service';
import { StudentsService } from '../students/students.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

function serializePayment(p: Payment) {
  return {
    id: p.id,
    studentId: p.studentId,
    amount: toMoney(p.amount),
    date: dateToIso(p.date),
    createdAt: p.createdAt,
  };
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly students: StudentsService,
  ) {}

  async create(dto: CreatePaymentDto) {
    await this.students.getOrThrow(dto.studentId);
    const date = dto.date ?? todayIso();
    const payment = await this.prisma.payment.create({
      data: {
        studentId: dto.studentId,
        amount: dto.amount,
        date: new Date(`${date}T00:00:00Z`),
      },
    });
    return serializePayment(payment);
  }

  async findByStudent(studentId: number) {
    await this.students.getOrThrow(studentId);
    const payments = await this.prisma.payment.findMany({
      where: { studentId },
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
    });
    return payments.map(serializePayment);
  }
}
