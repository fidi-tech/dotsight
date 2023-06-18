import { Module } from '@nestjs/common';
import { MixerService } from './services/mixer/mixer.service';

@Module({
  providers: [MixerService],
  exports: [MixerService],
})
export class MixersModule {}
