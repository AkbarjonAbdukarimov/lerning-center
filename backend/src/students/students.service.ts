import { Injectable, NotFoundException } from '@nestjs/common';
import { Student } from '@prisma/client';
import { toMoney } from '../common/money';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

export function serializeStudent(s: Student) {
  return {
    id: s.id,
    name: s.name,
    phone: s.phone,
    group: s.group,
    monthlyFee: toMoney(s.monthlyFee),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStudentDto) {
    const student = await this.prisma.student.create({ data: dto });
    return serializeStudent(student);
  }

  async findAll(group?: string) {
    const students = await this.prisma.student.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: 'asc' }, { name: 'asc' }],
    });
    return students.map(serializeStudent);
  }

  async findOne(id: number) {
    return serializeStudent(await this.getOrThrow(id));
  }

  async update(id: number, dto: UpdateStudentDto) {
    await this.getOrThrow(id);
    const student = await this.prisma.student.update({ where: { id }, data: dto });
    return serializeStudent(student);
  }

  async remove(id: number) {
    await this.getOrThrow(id);
    // Payments are removed by ON DELETE CASCADE.
    await this.prisma.student.delete({ where: { id } });
  }

  async getOrThrow(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id } });
    if (!student) throw new NotFoundException(`Student #${id} not found`);
    return student;
  }
}
