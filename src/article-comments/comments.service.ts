import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from 'src/users/user.entity';
import { I18nService } from 'nestjs-i18n';
import { ArticlesService } from 'src/articles/articles.service';
import { DEFAULT_ORDER } from 'src/constants';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly articlesService: ArticlesService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    articleSlug: string,
    createCommentDto: CreateCommentDto,
    author: User,
  ): Promise<Comment> {
    const article = await this.articlesService.findOrFailArticle(articleSlug);

    const comment = this.commentRepository.create({
      ...createCommentDto,
      articleId: article.id,
      author,
    });

    return await this.commentRepository.save(comment);
  }

  async findByArticleSlug(articleSlug: string): Promise<Comment[]> {
    const article = await this.articlesService.findOrFailArticle(articleSlug);

    return await this.commentRepository.find({
      where: { articleId: article.id },
      relations: ['author'],
      order: { createdAt: DEFAULT_ORDER },
    });
  }

  async delete(
    articleSlug: string,
    commentId: number,
    user: User,
  ): Promise<Comment> {
    await this.articlesService.findOrFailArticle(articleSlug);
    const comment = await this.findOrFailComment(commentId);

    if (comment.authorId !== user.id) {
      throw new ForbiddenException(this.i18n.t('comment.forbidden'));
    }

    return await this.commentRepository.remove(comment);
  }

  private async findOrFailComment(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(this.i18n.t('comment.notFound'));
    }

    return comment;
  }
}
