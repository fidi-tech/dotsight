import { ApiProperty } from '@nestjs/swagger';

export type DataSourceId = string;

export class DataSource {
  @ApiProperty({
    description: "data source's uuid",
  })
  id: DataSourceId;

  @ApiProperty({
    description: "data source's type",
  })
  type: string;

  @ApiProperty({
    description: "data source's specified config",
  })
  config: object;
}
