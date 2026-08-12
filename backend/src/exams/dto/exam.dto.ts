import {
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ExamQuestionInputDto {
  @IsString()
  question_id: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order_index?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score_weight?: number;
}

export class CreateExamDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  subject_id: string;

  @IsOptional()
  @IsIn(['official', 'practice', 'custom'])
  type?: 'official' | 'practice' | 'custom';

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  total_score?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamQuestionInputDto)
  questions?: ExamQuestionInputDto[];
}

export class GenerateMatrixDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsString()
  subject_id: string;

  @IsOptional()
  @IsString()
  chapter_id?: string;

  @IsOptional()
  @IsIn(['official', 'practice', 'custom'])
  type?: 'official' | 'practice' | 'custom';

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_minutes?: number;

  @IsObject()
  matrix: {
    nhan_biet?: number;
    thong_hieu?: number;
    van_dung?: number;
    van_dung_cao?: number;
  };
}
