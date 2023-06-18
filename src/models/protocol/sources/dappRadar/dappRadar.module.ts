import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DappRadarService } from './dappRadar.service';

@Module({
  imports: [HttpModule],
  providers: [DappRadarService],
  exports: [DappRadarService],
})
export class DappRadarModule {}
