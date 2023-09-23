import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddWidgetDto {
  @ApiProperty({
    description: "widget's type",
  })
  @IsString()
  readonly type: string;

  @ApiProperty({
    description: "widget's config",
  })
  @IsObject()
  readonly config: object;

  @ApiProperty({
    description: 'compatible datashape',
  })
  @IsString()
  readonly datashape: string;
}
