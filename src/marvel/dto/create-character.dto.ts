export class CharactersImportanceDto {
  name: string;
  appearance: number;
  thumbnail: string | null;

  constructor(partial: Partial<CharactersImportanceDto>) {
    Object.assign(this, partial);
  }
}
