import { ProtocolMetric } from '../../../common/metrics/protocol.metrics';
import { IsNotEmpty, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectId } from '../../project/interfaces/project.interface';

export class ProtocolMetricsQueryDto {
  @IsNotEmpty()
  @ApiProperty()
  metric: ProtocolMetric;

  @IsDateString()
  @ApiProperty()
  dateFrom: string;

  @IsDateString()
  @ApiProperty()
  dateTo: string;

  @IsNotEmpty()
  @ApiProperty()
  @IsUUID()
  projectId: ProjectId;
}
