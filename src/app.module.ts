import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../typeorm.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { WidgetsModule } from './widgets/widgets.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...config,
      migrations: [],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    WidgetsModule,
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
