import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProjectDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}
