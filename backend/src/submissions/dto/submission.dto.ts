import { IsOptional, IsString } from 'class-validator';

export class SubmitExamDto {
  @IsOptional()
  answers?: Record<string, { answer: string; statement_index?: number }[]>;

  @IsOptional()
  flagged?: string[];
}

export class SaveProgressDto extends SubmitExamDto {
  @IsOptional()
  @IsString()
  submitted?: string;
}
