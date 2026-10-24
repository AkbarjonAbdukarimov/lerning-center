import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsMonth } from '../../common/validators';

export class DebtorsQueryDto {
  @ApiPropertyOptional({ example: '2025-01', description: 'YYYY-MM, defaults to the current month' })
  @IsOptional()
  @IsMonth()
  month?: string;
}
