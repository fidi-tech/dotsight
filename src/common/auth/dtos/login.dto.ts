import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsNotEmpty()
  @ApiProperty()
  login: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
