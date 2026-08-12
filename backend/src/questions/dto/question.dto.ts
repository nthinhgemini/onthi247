import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OptionDto {
  @IsString()
  content: string;

  @IsBoolean()
  is_correct: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  order_index?: number;
}

export class CreateQuestionDto {
  @IsString()
  chapter_id: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsIn(['single_choice', 'multi_true_false', 'short_answer'])
  type?: 'single_choice' | 'multi_true_false' | 'short_answer';

  @IsOptional()
  @IsIn(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'])
  difficulty?: 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  chapter_id?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsIn(['single_choice', 'multi_true_false', 'short_answer'])
  type?: 'single_choice' | 'multi_true_false' | 'short_answer';

  @IsOptional()
  @IsIn(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'])
  difficulty?: 'nhan_biet' | 'thong_hieu' | 'van_dung' | 'van_dung_cao';

  @IsOptional()
  @IsString()
  image_url?: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsOptional()
  @IsIn(['draft', 'published'])
  status?: 'draft' | 'published';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options?: OptionDto[];
}

export class QueryQuestionsDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  chapter?: string;

  @IsOptional()
  @IsIn(['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'])
  difficulty?: string;

  @IsOptional()
  @IsIn(['single_choice', 'multi_true_false', 'short_answer'])
  type?: string;

  @IsOptional()
  @IsIn(['draft', 'published', 'rejected'])
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
