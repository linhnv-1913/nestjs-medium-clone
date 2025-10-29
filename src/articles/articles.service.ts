import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
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

  async findBySlug(slug: string): Promise<Article> {
    return this.findOrFailArticle(slug);
  }

  async update(
    updateArticleDto: UpdateArticleDto,
    slug: string,
    author: User,
  ): Promise<Article> {
    const article = await this.findOrFailArticle(slug);

    if (article.authorId !== author.id) {
      throw new ForbiddenException(this.i18n.t('article.forbidden'));
    }

    let newSlug = article.slug;
    if (updateArticleDto.title) {
      newSlug = this.generateSlug(updateArticleDto.title);
    }

    Object.assign(article, updateArticleDto, { slug: newSlug });
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

  async delete(slug: string, author: User): Promise<Article> {
    const article = await this.findOrFailArticle(slug);

    if (article.authorId !== author.id) {
      throw new ForbiddenException(this.i18n.t('article.forbidden'));
    }

    return await this.articleRepository.remove(article);
  }

  async findOrFailArticle(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      where: { slug },
    });

    if (!article) {
      throw new NotFoundException(this.i18n.t('article.notFound'));
    }

    return article;
  }

  async favorite(slug: string, userId: number): Promise<Article> {
    const article = await this.findOrFailArticle(slug);

    if (article.userFavoriteIds.includes(userId)) {
      throw new BadRequestException(this.i18n.t('article.alreadyFavorited'));
    }

    article.userFavoriteIds.push(userId);
    article.favoritesCount += 1;
    article.favorited = true;
    return await this.articleRepository.save(article);
  }

  async unfavorite(slug: string, userId: number): Promise<Article> {
    const article = await this.findOrFailArticle(slug);

    if (!article.userFavoriteIds.includes(userId)) {
      throw new BadRequestException(this.i18n.t('article.notFavorited'));
    }

    article.userFavoriteIds = article.userFavoriteIds.filter(
      (id) => id !== userId,
    );
    article.favoritesCount = article.userFavoriteIds.length;
    article.favorited = false;

    return await this.articleRepository.save(article);
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
}
