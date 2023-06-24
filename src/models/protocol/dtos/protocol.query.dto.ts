import { ProjectId } from '../../project/interfaces/project.interface';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProtocolQueryDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsUUID()
  projectId: ProjectId;
}
