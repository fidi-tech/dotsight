import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class SaveWidgetDto {
  @ApiProperty({
    description: "widget's name",
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    description: "widget's view",
    required: false,
  })
  @IsString()
  @IsOptional()
  readonly view?: string;

  @ApiProperty({
    description: "widget's view's config",
    required: false,
  })
  @IsObject()
  @IsOptional()
  readonly viewParameters?: object;

  @ApiProperty({
    description: "widget's visibility",
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  readonly isPublic?: boolean;
}
