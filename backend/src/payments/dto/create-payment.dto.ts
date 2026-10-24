import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsPositive, Max } from 'class-validator';
import { IsCalendarDate } from '../../common/validators';

export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  studentId: number;

  @ApiProperty({ example: 250000 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999_999_999)
  amount: number;

  @ApiPropertyOptional({ example: '2025-01-15', description: 'YYYY-MM-DD, defaults to today' })
  @IsOptional()
  @IsCalendarDate()
  date?: string;
}
