import { ApiProperty } from '@nestjs/swagger';

class TimeSeriesPiece {
  @ApiProperty()
  time: string;
  @ApiProperty()
  value: number;
}

export class TimeSeries {
  @ApiProperty({ type: String })
  type = 'time-series' as const;

  @ApiProperty({ isArray: true, type: TimeSeriesPiece })
  data: TimeSeriesPiece[];

  constructor(data: TimeSeriesPiece[]) {
    this.data = data;
  }
}
