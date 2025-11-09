import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpiryModule } from './expiry/expiry.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true, cache: true }),
    ExpiryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
