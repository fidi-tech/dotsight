import { ProjectId } from '../../project/interfaces/project.interface';
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProtocolQueryDto {
  @IsNotEmpty()
  @ApiProperty()
  projectId: ProjectId;
}
