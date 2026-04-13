import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveTaskDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  targetListId!: string;

  @ApiProperty({ example: 0, required: false, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
