import { Controller, Get, Param } from '@nestjs/common';
import { CharacterService } from '../services/app.service';
import { Character } from '../interfaces/character.interface';

@Controller('marvel')
export class ChractersController {
  constructor(private readonly characterService: CharacterService) {}

  @Get('comics/:upc/characters')
  async getCharactersByComicUPC(
    @Param('upc') upc: string,
  ): Promise<Character[]> {
    return this.characterService.getCharactersByComicUPC(upc);
  }
}
