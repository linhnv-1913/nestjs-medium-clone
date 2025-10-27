import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsArray,
  IsOptional,
} from 'class-validator';
import { BODY_MAX_LENGTH, TITLE_MAX_LENGTH } from 'src/constants';

export class CreateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'How to build a NestJS application',
    maxLength: TITLE_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(TITLE_MAX_LENGTH)
  title: string;

  @ApiProperty({
    description: 'Article description',
    example: 'A comprehensive guide to building NestJS apps',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Article body',
    example: 'NestJS is a progressive Node.js framework...',
    maxLength: BODY_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(BODY_MAX_LENGTH)
  body: string;

  @ApiProperty({
    description: 'List of tags',
    example: ['nestjs', 'typescript', 'backend'],
    required: false,
  })
  @IsArray()
  @IsOptional()
  tagList?: string[];
}
