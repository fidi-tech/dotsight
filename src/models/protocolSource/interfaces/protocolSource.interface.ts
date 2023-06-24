import {
  IProject,
  ProjectId,
} from '../../project/interfaces/project.interface';

export interface IProtocolSource {
  id: string;
  type: string;
  config: object;
  projectId: ProjectId;
  project: IProject;
}
