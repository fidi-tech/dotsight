import { ProjectId } from '../../project/interfaces/project.interface';
import { IsNotEmpty, IsObject, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProtocolSourceDto {
  @IsNotEmpty()
  @ApiProperty()
  type: string;

  @IsNotEmpty()
  @IsObject()
  config: object;

  @IsNotEmpty()
  @ApiProperty()
  @IsUUID()
  projectId: ProjectId;
}
