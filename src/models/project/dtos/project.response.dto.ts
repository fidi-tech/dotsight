import { ActorId } from '../../actor/interfaces/actor.interface';
import { ProjectId } from '../interfaces/project.interface';
import { ApiProperty } from '@nestjs/swagger';

export class ProjectResponseDto {
  @ApiProperty()
  id: ProjectId;
  @ApiProperty()
  name: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  createdBy: ActorId;
}
