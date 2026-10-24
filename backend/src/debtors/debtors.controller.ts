import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { currentMonth } from '../common/dates';
import { DebtorsService } from './debtors.service';
import { DebtorsQueryDto } from './dto/debtors-query.dto';

@ApiTags('debtors')
@Controller('debtors')
export class DebtorsController {
  constructor(private readonly debtors: DebtorsService) {}

  @Get()
  find(@Query() query: DebtorsQueryDto) {
    return this.debtors.findDebtors(query.month ?? currentMonth());
  }
}
