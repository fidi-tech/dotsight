import {
  Plugin,
  PluginBadConfigError as _PluginBadConfigError,
} from './plugin';
import { Observable } from 'rxjs';
import {
  IProtocol,
  ProtocolId,
} from '../models/protocol/interfaces/protocol.interface';
import { ProtocolMetric } from '../common/metrics/protocol.metrics';
import { TimeSeries } from '../common/metrics';

export const PluginBadConfigError = _PluginBadConfigError;

export abstract class ProtocolPlugin<C> extends Plugin<C> {
  abstract getProtocols(): Observable<IProtocol>;
  abstract getProtocolById(id: ProtocolId): Promise<IProtocol | null>;
  abstract getProtocolMetric(
    id: ProtocolId,
    metric: ProtocolMetric,
    dateFrom: string,
    dateTo: string,
  ): Promise<TimeSeries>;
}
