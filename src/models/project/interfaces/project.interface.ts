import { ActorId, IActor } from '../../actor/interfaces/actor.interface';

export type ProjectId = string;

export interface IProject {
  id: ProjectId;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: ActorId;
  creator: IActor;
}
