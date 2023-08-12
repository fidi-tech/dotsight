import { Middleware } from './middleware';
import { Protocol } from '../../common/protocol';

export abstract class ProtocolMiddleware<C> extends Middleware<C, Protocol> {}
