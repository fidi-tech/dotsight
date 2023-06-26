import { ProjectId } from '../../project/interfaces/project.interface';
import { ActorId } from '../../actor/interfaces/actor.interface';
import { ProtocolSourceId } from '../interfaces/protocolSource.interface';
import { ApiProperty } from '@nestjs/swagger';

export class ProtocolSourceResponseDto {
  @ApiProperty()
  id: ProtocolSourceId;
  @ApiProperty()
  type: string;
  @ApiProperty()
  config: object;
  @ApiProperty()
  projectId: ProjectId;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  createdBy: ActorId;
}
