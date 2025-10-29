import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/user.entity';
import {
  ErrorResponse,
  SuccessResponse,
} from 'src/common/decorators/response.decorator';
import { createListResponseDto } from 'src/common/dto/list-response.dto';

@Controller('articles/:articleSlug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a comment to an article' })
  @ApiResponse(SuccessResponse(201, 'Comment created', CommentResponseDto))
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  async create(
    @Param('articleSlug') articleSlug: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.create(
      articleSlug,
      createCommentDto,
      user,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all comments for an article' })
  @ApiResponse(
    SuccessResponse(
      200,
      'Comments retrieved successfully',
      createListResponseDto(CommentResponseDto, 'comments'),
    ),
  )
  @ApiResponse(ErrorResponse(404, 'Article not found'))
  async findAll(@Param('articleSlug') articleSlug: string) {
    return await this.commentsService.findByArticleSlug(articleSlug);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse(SuccessResponse(200, 'Comment deleted', CommentResponseDto))
  @ApiResponse(ErrorResponse(404, 'Comment not found'))
  @ApiResponse(
    ErrorResponse(403, 'You are not authorized to delete this comment'),
  )
  async delete(
    @Param('articleSlug') articleSlug: string,
    @Param('id', ParseIntPipe) commentId: number,
    @CurrentUser() user: User,
  ) {
    return await this.commentsService.delete(articleSlug, commentId, user);
  }
}
