import {
  IProject,
  ProjectId,
} from '../../project/interfaces/project.interface';
import { ActorId, IActor } from '../../actor/interfaces/actor.interface';

export type ProtocolSourceId = string;

export interface IProtocolSource {
  id: ProtocolSourceId;
  type: string;
  config: object;
  projectId: ProjectId;
  project: IProject;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ActorId;
  creator: IActor;
}
