import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { User } from 'src/users/user.entity';
import { I18nService } from 'nestjs-i18n';
import { UpdateArticleDto } from './dto/update-article.dto';
import {
  DEFAULT_ORDER,
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from 'src/constants';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly i18n: I18nService,
  ) {}

  async create(
    createArticleDto: CreateArticleDto,
    author: User,
  ): Promise<Article> {
    const slug = this.generateSlug(createArticleDto.title);

    const article = this.articleRepository.create({
      ...createArticleDto,
      slug,
      author,
    });

    await this.articleRepository.save(article);
    return this.i18n.t('article.created');
  }

  async findById(id: number): Promise<Article> {
    return this.findArticleOrFail(id);
  }

  async update(
    updateArticleDto: UpdateArticleDto,
    id: number,
    author: User,
  ): Promise<Article> {
    const article = await this.findArticleOrFail(id);

    if (article.authorId !== author.id) {
      throw new ForbiddenException(this.i18n.t('article.forbidden'));
    }

    let slug = article.slug;
    if (updateArticleDto.title) {
      slug = this.generateSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto, { slug });
    return await this.articleRepository.save(article);
  }

  async listArticles(
    page: number = DEFAULT_PAGINATION_PAGE,
    limit: number = DEFAULT_PAGINATION_LIMIT,
  ): Promise<{ articles: Article[]; total: number }> {
    const [articles, total] = await this.articleRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: DEFAULT_ORDER },
    });

    return { articles, total };
  }

  async deleteById(id: number, author: User): Promise<Article> {
    const article = await this.findArticleOrFail(id);

    if (article.authorId !== author.id) {
      throw new ForbiddenException(this.i18n.t('article.forbidden'));
    }

    return await this.articleRepository.remove(article);
  }

  private generateSlug(title: string): string {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const timestamp = Date.now();
    return `${slug}-${timestamp}`;
  }

  private async findArticleOrFail(id: number): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(this.i18n.t('article.notFound'));
    }

    return article;
  }
}
