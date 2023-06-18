import { DappRadarService } from './dappRadar/dappRadar.service';
import { Inject } from '@nestjs/common';

export enum SourcesServiceType {
  DAPP_RADAR = 'DAPP_RADAR',
}

class ProtocolSourceNotFoundError extends Error {}

export class SourcesService {
  constructor(
    @Inject(DappRadarService)
    private readonly dappRadar: DappRadarService,
  ) {}

  getSourceByType(type: SourcesServiceType) {
    switch (type) {
      case SourcesServiceType.DAPP_RADAR:
        return this.dappRadar;
      default:
        throw new ProtocolSourceNotFoundError(`${type} was not found`);
    }
  }
}
