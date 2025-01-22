/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CharactersImportaceDto } from './dto/characters-importance.dto';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { Comic } from '../interfaces/characters.interface';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class CharacterService {
  constructor(private configService: ConfigService) {}

  private getAuthParams(): string {
    const publicKey = this.configService.get<string>('MARVEL_PUBLIC_KEY');
    const timestamp = new Date().getTime().toString();
    const privateKey = this.configService.get<string>('MARVEL_PRIVATE_KEY');
    const hash = CryptoJS.MD5(timestamp + privateKey + publicKey).toString();
    return `ts=${timestamp}&APIKEY=${publicKey}&HASH=${hash}`;
  }

  private async getComicByUPC(upc: string): Promise<Comic> {
    try {
      const baseUrl = this.configService.get<string>('MARVEL_BASE_URL');
      const url = `${baseUrl}/comics?upc=${upc}&${this.getAuthParams()}`;
      const response = await axios.get(url);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const comics = response.data.data.results;

      if (!comics || comics.length === 0) {
        throw new HttpException(`Comic not found`, HttpStatus.NOT_FOUND);
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return comics[0];
    } catch (error) {
      console.error(
        'Error in getComicByUPC: ',
        error.response?.data || error.message,
      );
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error fetching comic: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
