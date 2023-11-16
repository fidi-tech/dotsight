import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddMapperDto {
  @ApiProperty({
    description: 'human-readable mapper code',
  })
  @IsString()
  readonly code: string;

  @ApiProperty({
    description: "mapper's code",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    description: "mapper's config",
  })
  @IsObject()
  readonly config: object;
}
