import { Module } from '@nestjs/common';
import { TestController } from './test.controller';

@Module({
  imports: [],
  controllers: [TestController],
})
export class AppModule {}
