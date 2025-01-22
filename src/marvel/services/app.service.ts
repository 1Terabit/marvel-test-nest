import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto-js';
import { Character } from '../interfaces/character.interface';

@Injectable()
export class CharacterService {
  constructor(private configService: ConfigService) {}

  private getAuthParams(): string {
    const timestamp = new Date().getTime().toString();
    const publicKey = this.configService.get<string>('MARVEL_API_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('MARVEL_API_PRIVATE_KEY');
    const hash = crypto.MD5(timestamp + privateKey + publicKey).toString();

    return `ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;
  }

  private async getComicByUPC(upc: string): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('MARVEL_API_URL');
      const url = `${baseUrl}/comics?upc=${upc}&${this.getAuthParams()}`;

      console.log('Fetching comic with URL:', url);
      const response = await axios.get(url);
      const comics = response.data.data.results;

      if (!comics || comics.length === 0) {
        throw new HttpException('Comic not found', HttpStatus.NOT_FOUND);
      }

      return comics[0];
    } catch (error) {
      console.error(
        'Error in getComicByUPC:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        `Error fetching comic: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getCharacterComicsCount(characterId: string): Promise<number> {
    try {
      const baseUrl = this.configService.get<string>('MARVEL_API_URL');
      const url = `${baseUrl}/characters/${characterId}/comics?${this.getAuthParams()}`;

      const response = await axios.get(url);
      return response.data.data.total;
    } catch (error) {
      console.error(
        `Error getting comics count for character ${characterId}:`,
        error.message,
      );
      return 0;
    }
  }

  private async getCharacterDetails(characterId: string): Promise<any> {
    try {
      const baseUrl = this.configService.get<string>('MARVEL_API_URL');
      const url = `${baseUrl}/characters/${characterId}?${this.getAuthParams()}`;

      const response = await axios.get(url);
      return response.data.data.results[0];
    } catch (error) {
      console.error(
        `Error getting character details ${characterId}:`,
        error.message,
      );
      return null;
    }
  }

  async getCharactersByComicUPC(upc: string): Promise<Character[]> {
    try {
      console.log('Starting getCharactersByComicUPC with UPC:', upc);

      const comic = await this.getComicByUPC(upc);
      console.log('Comic found:', comic.title);

      if (!comic.characters || !comic.characters.items) {
        throw new HttpException(
          'No characters found for this comic',
          HttpStatus.NOT_FOUND,
        );
      }

      const characterPromises = comic.characters.items.map(
        async (char: any) => {
          const characterId = char.resourceURI.split('/').pop();
          try {
            const [appearances, details] = await Promise.all([
              this.getCharacterComicsCount(characterId),
              this.getCharacterDetails(characterId),
            ]);

            return {
              name: char.name,
              appearances,
              thumbnail: details
                ? `${details.thumbnail.path}.${details.thumbnail.extension}`
                : null,
            };
          } catch (charError) {
            console.error(
              `Error processing character ${char.name}:`,
              charError,
            );
            return {
              name: char.name,
              appearances: 0,
              thumbnail: null,
            };
          }
        },
      );

      const characters = await Promise.all(characterPromises);
      return characters.sort((a, b) => b.appearances - a.appearances);
    } catch (error) {
      console.error('Error in getCharactersByComicUPC:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error fetching characters by comic UPC: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
