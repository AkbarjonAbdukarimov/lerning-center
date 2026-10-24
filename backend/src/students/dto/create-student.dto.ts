import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsString, Matches, Max, MaxLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class CreateStudentDto {
  @ApiProperty({ example: 'Иван Петров' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '+998 90 123-45-67' })
  @Transform(trim)
  @IsString()
  @Matches(/^\+?[0-9\s\-()]{7,20}$/, { message: 'phone must be a valid phone number' })
  phone: string;

  @ApiProperty({ example: 'JS-1' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  group: string;

  @ApiProperty({ example: 500000, description: 'Monthly fee' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Max(999_999_999)
  monthlyFee: number;
}
