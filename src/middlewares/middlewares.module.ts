import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareService } from './services/middleware/middleware.service';

@Module({
  imports: [HttpModule],
  providers: [MiddlewareService],
  exports: [MiddlewareService],
})
export class MiddlewaresModule {}
