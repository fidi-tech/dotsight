import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class SaveWidgetDto {
  @ApiProperty({
    description: "widget's name",
    nullable: true,
  })
  @IsString()
  @IsOptional()
  readonly name?: string;

  @ApiProperty({
    description: "widget's view",
    nullable: true,
  })
  @IsString()
  @IsOptional()
  readonly view?: string;

  @ApiProperty({
    description: "widget's view's config",
    nullable: true,
  })
  @IsObject()
  @IsOptional()
  readonly viewParameters?: object;
}
