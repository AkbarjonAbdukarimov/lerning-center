import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ListStudentsDto {
  @ApiPropertyOptional({ example: 'JS-1', description: 'Filter by group' })
  @IsOptional()
  @IsString()
  group?: string;
}
