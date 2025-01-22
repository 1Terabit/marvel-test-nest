import { Module } from '@nestjs/common';
import { ChractersController } from './marvel/controller/app.controller';
import { CharacterService } from './marvel/services/app.service';
import { ConfigModule } from '@nestjs/config';
import { MarvelModule } from './marvel/module/marvel.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MarvelModule,
  ],
  controllers: [ChractersController],
  providers: [CharacterService],
})
export class AppModule {}
