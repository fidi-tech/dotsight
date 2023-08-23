export type MiddlewareId = string;

export class Middleware {
  id: MiddlewareId;
  type: string;
  config: object;
}
