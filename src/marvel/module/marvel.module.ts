import { Module } from '@nestjs/common';
import { ChractersController } from '../controller/app.controller';
import { CharacterService } from '../services/app.service';

@Module({
  controllers: [ChractersController],
  providers: [CharacterService],
})
export class MarvelModule {}
