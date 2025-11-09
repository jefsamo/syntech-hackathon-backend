import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExpiryModule } from './expiry/expiry.module';

@Module({
  imports: [ExpiryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
