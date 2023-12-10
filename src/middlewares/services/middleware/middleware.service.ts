import { Injectable } from '@nestjs/common';
import { collection } from '../../collection';
import { AbstractMiddleware } from '../../abstract.middleware';

class MiddlewareNotFound extends Error {
  constructor(type) {
    super(`Middleware with type "${type}" not found`);
  }
}

@Injectable()
export class MiddlewareService {
  instantiate(type: string, config: object): AbstractMiddleware<any, any, any> {
    const middleware = collection[type];
    if (!middleware) {
      throw new MiddlewareNotFound(type);
    }
    return new middleware(config);
  }

  getEntityByType(type: string): string {
    const middleware = collection[type];
    if (!middleware) {
      throw new MiddlewareNotFound(type);
    }
    return middleware.getEntity();
  }

  getParamsByType(type: string) {
    return collection[type].getParamsSchema();
  }
}
