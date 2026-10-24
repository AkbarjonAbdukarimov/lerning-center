import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ListPaymentsDto } from './dto/list-payments.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('payments')
  create(@Body() dto: CreatePaymentDto) {
    return this.payments.create(dto);
  }

  @Get('payments')
  list(@Query() query: ListPaymentsDto) {
    return this.payments.findByStudent(query.studentId);
  }

  @Get('students/:id/payments')
  listForStudent(@Param('id', ParseIntPipe) id: number) {
    return this.payments.findByStudent(id);
  }
}
