import { IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTaskListDto {
  @ApiProperty({ example: 'Updated List Name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;
}
