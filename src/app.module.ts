import { Module } from '@nestjs/common';
import { AppController } from './marvel/controller/app.controller';
import { AppService } from './marvel/services/app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
