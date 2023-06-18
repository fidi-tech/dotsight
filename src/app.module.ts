import { Module } from '@nestjs/common';
import { ProtocolsModule } from './models/protocol/protocols.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProtocolSource } from './models/protocol/entities/protocolSource.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      username: 'fidi',
      password: 's@m3pwd',
      database: 'fidi',
      entities: [ProtocolSource],
      synchronize: true,
    }),
    ProtocolsModule,
  ],
})
export class AppModule {}
