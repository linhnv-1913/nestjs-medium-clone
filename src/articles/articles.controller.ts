import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
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

@Controller('api/articles')
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiResponse(SuccessResponse(200, 'Article found', ArticleResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  async findById(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findById(id);
  }

  @Put(':id')
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
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.articlesService.update(updateArticleDto, id, user);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete an article' })
  @ApiResponse(SuccessResponse(200, 'Article deleted', ArticleResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  @ApiResponse(
    ErrorResponse(403, 'You are not authorized to delete this article'),
  )
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: User,
  ) {
    return await this.articlesService.deleteById(id, user);
  }
}
