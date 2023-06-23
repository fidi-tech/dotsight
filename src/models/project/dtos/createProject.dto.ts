import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
