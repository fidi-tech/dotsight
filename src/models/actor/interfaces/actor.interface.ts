export type ActorId = string;

export interface IActor {
  id: ActorId;
  login: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
