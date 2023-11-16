import { IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddDataSourceDto {
  @ApiProperty({
    description: "data source's type",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    description: "data source's config",
  })
  @IsObject()
  readonly config: object;
}
