import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trace } from './entities/trace.entity';
import { TracePiece } from './entities/trace-piece.entity';
import { TraceService } from './services/trace.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trace, TracePiece])],
  providers: [TraceService],
  exports: [TraceService],
})
export class TraceModule {}
