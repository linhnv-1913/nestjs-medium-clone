import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsArray, IsOptional } from 'class-validator';
import { BODY_MAX_LENGTH, TITLE_MAX_LENGTH } from 'src/constants';

export class UpdateArticleDto {
  @ApiProperty({
    description: 'Article title',
    example: 'How to build a NestJS application',
    maxLength: TITLE_MAX_LENGTH,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(TITLE_MAX_LENGTH)
  title?: string;

  @ApiProperty({
    description: 'Article description',
    example: 'A comprehensive guide to building NestJS apps',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Article body',
    example: 'NestJS is a progressive Node.js framework...',
    maxLength: BODY_MAX_LENGTH,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(BODY_MAX_LENGTH)
  body?: string;

  @ApiProperty({
    description: 'List of tags',
    example: ['nestjs', 'typescript', 'backend'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  tagList?: string[];
}
