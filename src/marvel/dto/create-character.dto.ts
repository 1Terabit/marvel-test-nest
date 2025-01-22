export class CharacterImportanceDto {
  name: string;
  appearance: number;
  thumbnail: string | null;

  constructor(partial: Partial<CharacterImportanceDto>) {
    Object.assign(this, partial);
  }
}
