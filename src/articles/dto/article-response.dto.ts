import { ApiProperty } from '@nestjs/swagger';

export class ArticleResponseDto {
  @ApiProperty({ example: 'Article Title' })
  title: string;

  @ApiProperty({ example: 'Article Body' })
  body: string;

  @ApiProperty({ example: 'Article Description' })
  description: string;

  @ApiProperty({ example: 'Article Slug' })
  slug: string;

  @ApiProperty({ example: ['tag1', 'tag2'] })
  tagList: string[];

  @ApiProperty({ example: false })
  favorited: boolean;

  @ApiProperty({ example: 0 })
  favoritesCount: number;

  @ApiProperty({ example: 1 })
  authorId: number;
}
