import { Module } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { DappRadarModule } from './dappRadar/dappRadar.module';

@Module({
  imports: [DappRadarModule],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}
