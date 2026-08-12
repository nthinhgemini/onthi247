import { IsOptional, IsString } from 'class-validator';

export class UpsertNoteDto {
  @IsString()
  title!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  subject_id?: string;
}
