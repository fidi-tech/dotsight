import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthId = createParamDecorator((_, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.userId ?? null;
});
