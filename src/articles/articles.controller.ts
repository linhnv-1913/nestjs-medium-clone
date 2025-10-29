import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import {
  ErrorResponse,
  SuccessResponse,
} from '../common/decorators/response.decorator';
import { createListResponseDto } from 'src/common/dto/list-response.dto';
import { ListRequestDto } from 'src/common/dto/list-request.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse(SuccessResponse(201, 'Article created'))
  @ApiResponse(ErrorResponse(409, 'Article slug already exists'))
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: User,
  ) {
    return await this.articlesService.create(createArticleDto, user);
  }

  @Get(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get article by slug' })
  @ApiResponse(SuccessResponse(200, 'Article found', ArticleResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing article' })
  @ApiResponse(SuccessResponse(200, 'Article updated'))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  @ApiResponse(ErrorResponse(409, 'Article slug already exists'))
  @ApiResponse(
    ErrorResponse(403, 'You are not authorized to update this article'),
  )
  async update(
    @Body() updateArticleDto: UpdateArticleDto,
    @Param('slug') slug: string,
    @CurrentUser() user: User,
  ) {
    return await this.articlesService.update(updateArticleDto, slug, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all articles' })
  @ApiResponse(
    SuccessResponse(
      200,
      'Articles retrieved successfully',
      createListResponseDto(ArticleResponseDto, 'articles'),
    ),
  )
  async listArticles(@Query() ListRequestDto: ListRequestDto) {
    return this.articlesService.listArticles(
      ListRequestDto.page,
      ListRequestDto.limit,
    );
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse(SuccessResponse(200, 'Article deleted', ArticleResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  @ApiResponse(
    ErrorResponse(403, 'You are not authorized to delete this article'),
  )
  async delete(@Param('slug') slug: string, @CurrentUser() user: User) {
    return await this.articlesService.delete(slug, user);
  }

  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Favorite an article' })
  @ApiResponse(SuccessResponse(200, 'Article favorited', ArticleResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  @ApiResponse(ErrorResponse(400, 'You have already favorited this article'))
  async favorite(@Param('slug') slug: string, @CurrentUser() user: User) {
    return await this.articlesService.favorite(slug, user.id);
  }

  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unfavorite an article' })
  @ApiResponse(SuccessResponse(200, 'Article unfavorited', ArticleResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  @ApiResponse(ErrorResponse(400, 'You have not favorited this article'))
  async unfavorite(@Param('slug') slug: string, @CurrentUser() user: User) {
    return await this.articlesService.unfavorite(slug, user.id);
  }
}
