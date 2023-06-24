import {
  IProject,
  ProjectId,
} from '../../project/interfaces/project.interface';
import { ActorId, IActor } from '../../actor/interfaces/actor.interface';

export interface IProtocolSource {
  id: string;
  type: string;
  config: object;
  projectId: ProjectId;
  project: IProject;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ActorId;
  creator: IActor;
}
