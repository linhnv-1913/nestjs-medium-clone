import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesService } from './articles.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Article } from './article.entity';
import { I18nService } from 'nestjs-i18n';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { mockArticle, mockUser, mockUser2 } from '../../test/mocks';
import { validate } from 'class-validator';

describe('ArticlesService', () => {
  let service: ArticlesService;

  const mockArticleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createArticleDto: CreateArticleDto = {
      title: 'Test Article Title',
      description: 'Test description',
      body: 'Test body',
      tagList: ['test', 'article'],
    };

    it('should create a new article successfully', async () => {
      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      const result = await service.create(createArticleDto, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createArticleDto,
          slug: expect.any(String) as string,
          author: mockUser,
        }),
      );
      expect(mockArticleRepository.save).toHaveBeenCalled();
      expect(result).toBe('Article created successfully');
    });

    it('should generate a slug from the title', async () => {
      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      await service.create(createArticleDto, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/^test-article-title-\d+$/) as string,
        }),
      );
    });

    it('should throw error when title exceeds maximum length', async () => {
      const errors = await validate(
        Object.assign(new CreateArticleDto(), {
          ...createArticleDto,
          title: 'A'.repeat(51),
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should throw error when title is empty', async () => {
      const errors = await validate(
        Object.assign(new CreateArticleDto(), {
          ...createArticleDto,
          title: '',
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should throw error when description is empty', async () => {
      const errors = await validate(
        Object.assign(new CreateArticleDto(), {
          ...createArticleDto,
          description: '',
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('description');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should throw error when body is empty', async () => {
      const errors = await validate(
        Object.assign(new CreateArticleDto(), {
          ...createArticleDto,
          body: '',
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('body');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should throw error when body exceeds maximum length', async () => {
      const errors = await validate(
        Object.assign(new CreateArticleDto(), {
          ...createArticleDto,
          body: 'A'.repeat(256),
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('body');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should throw error when tagList is not an array', async () => {
      const errors = await validate(
        Object.assign(new CreateArticleDto(), {
          ...createArticleDto,
          tagList: 'not-an-array' as unknown as string[],
        }),
      );

      expect(errors.length).toEqual(1);
      const tagListError = errors.find((error) => error.property === 'tagList');
      expect(tagListError).toBeDefined();
      expect(tagListError?.constraints).toHaveProperty('isArray');
    });

    it('should successfully create article without tagList', async () => {
      const dtoWithoutTagList = {
        title: createArticleDto.title,
        description: createArticleDto.description,
        body: createArticleDto.body,
      };

      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      const result = await service.create(dtoWithoutTagList, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalled();
      expect(result).toBe('Article created successfully');
    });
  });

  describe('findBySlug', () => {
    it('should return an article by slug', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      const result = await service.findBySlug('test-article-123456');

      expect(mockArticleRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-article-123456' },
      });
      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('Article not found');

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockI18nService.t).toHaveBeenCalledWith('article.notFound');
    });
  });

  describe('update', () => {
    const updateArticleDto: UpdateArticleDto = {
      title: 'Updated Title',
      description: 'Updated description',
    };

    it('should update an article successfully', async () => {
      const updatedArticle = { ...mockArticle, ...updateArticleDto };

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(updatedArticle);

      const result = await service.update(
        updateArticleDto,
        'test-article-123456',
        mockUser,
      );

      expect(mockArticleRepository.findOne).toHaveBeenCalled();
      expect(mockArticleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockArticle,
          ...updateArticleDto,
          slug: expect.any(String) as string,
        }),
      );
      expect(result).toEqual(updatedArticle);
    });

    it('should throw error when title exceeds maximum length', async () => {
      const errors = await validate(
        Object.assign(new UpdateArticleDto(), {
          ...updateArticleDto,
          title: 'A'.repeat(51),
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('title');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should throw error when body exceeds maximum length', async () => {
      const errors = await validate(
        Object.assign(new UpdateArticleDto(), {
          ...updateArticleDto,
          body: 'A'.repeat(256),
        }),
      );

      expect(errors.length).toEqual(1);
      expect(errors[0].property).toBe('body');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should throw error when tagList is not an array', async () => {
      const errors = await validate(
        Object.assign(new UpdateArticleDto(), {
          ...updateArticleDto,
          tagList: 'not-an-array' as unknown as string[],
        }),
      );

      expect(errors.length).toEqual(1);
      const tagListError = errors.find((error) => error.property === 'tagList');
      expect(tagListError).toBeDefined();
      expect(tagListError?.constraints).toHaveProperty('isArray');
    });

    it('should successfully update article with only title', async () => {
      const dtoWithOnlyTitle = {
        title: updateArticleDto.title,
      };

      const updatedArticle = { ...mockArticle, ...dtoWithOnlyTitle };

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(updatedArticle);

      const result = await service.update(
        dtoWithOnlyTitle,
        'test-article-123456',
        mockUser,
      );

      expect(mockArticleRepository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedArticle);
    });

    it('should generate new slug when title is updated', async () => {
      const updateArticleDto: UpdateArticleDto = {
        title: 'New Title',
      };

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);

      await service.update(updateArticleDto, 'test-article-123456', mockUser);

      expect(mockArticleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/^new-title-\d+$/) as string,
        }),
      );
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Title',
      };

      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Forbidden');

      await expect(
        service.update(updateArticleDto, 'test-article-123456', mockUser2),
      ).rejects.toThrow(ForbiddenException);
      expect(mockI18nService.t).toHaveBeenCalledWith('article.forbidden');
    });

    it('should throw NotFoundException if article not found', async () => {
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Title',
      };

      mockArticleRepository.findOne.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('Article not found');

      await expect(
        service.update(updateArticleDto, 'non-existent-slug', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('listArticles', () => {
    it('should return paginated articles with default values', async () => {
      const articles = [mockArticle];
      mockArticleRepository.findAndCount.mockResolvedValue([articles, 1]);

      const result = await service.listArticles();

      expect(mockArticleRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ articles, total: 1 });
    });

    it('should return paginated articles with custom page and limit', async () => {
      const articles = [mockArticle];
      mockArticleRepository.findAndCount.mockResolvedValue([articles, 1]);

      const result = await service.listArticles(2, 20);

      expect(mockArticleRepository.findAndCount).toHaveBeenCalledWith({
        skip: 20,
        take: 20,
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual({ articles, total: 1 });
    });

    it('should return empty array when no articles exist', async () => {
      mockArticleRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.listArticles();

      expect(result).toEqual({ articles: [], total: 0 });
    });
  });

  describe('delete', () => {
    it('should delete an article successfully', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockArticleRepository.remove.mockResolvedValue(mockArticle);

      const result = await service.delete('test-article-123456', mockUser);

      expect(mockArticleRepository.findOne).toHaveBeenCalled();
      expect(mockArticleRepository.remove).toHaveBeenCalledWith(mockArticle);
      expect(result).toEqual(mockArticle);
    });

    it('should throw ForbiddenException if user is not the author', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Forbidden');

      await expect(
        service.delete('test-article-123456', mockUser2),
      ).rejects.toThrow(ForbiddenException);
      expect(mockI18nService.t).toHaveBeenCalledWith('article.forbidden');
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('Article not found');

      await expect(
        service.delete('non-existent-slug', mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOrFailArticle', () => {
    it('should return an article when found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(mockArticle);

      const result = await service.findOrFailArticle('test-article-123456');

      expect(result).toEqual(mockArticle);
    });

    it('should throw NotFoundException when article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('Article not found');

      await expect(
        service.findOrFailArticle('non-existent-slug'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('favorite', () => {
    it('should favorite an article successfully', async () => {
      const article = { ...mockArticle, userFavoriteIds: [] };
      const favoritedArticle = {
        ...article,
        userFavoriteIds: [1],
        favoritesCount: 1,
        favorited: true,
      };

      mockArticleRepository.findOne.mockResolvedValue(article);
      mockArticleRepository.save.mockResolvedValue(favoritedArticle);

      const result = await service.favorite('test-article-123456', 1);

      expect(mockArticleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userFavoriteIds: [1],
          favoritesCount: 1,
          favorited: true,
        }),
      );
      expect(result).toEqual(favoritedArticle);
    });

    it('should throw BadRequestException if article already favorited', async () => {
      const article = { ...mockArticle, userFavoriteIds: [1] };

      mockArticleRepository.findOne.mockResolvedValue(article);
      mockI18nService.t.mockReturnValue('Article already favorited');

      await expect(service.favorite('test-article-123456', 1)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockI18nService.t).toHaveBeenCalledWith(
        'article.alreadyFavorited',
      );
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('Article not found');

      await expect(service.favorite('non-existent-slug', 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unfavorite', () => {
    it('should unfavorite an article successfully', async () => {
      const article = {
        ...mockArticle,
        userFavoriteIds: [1],
        favoritesCount: 1,
        favorited: true,
      };
      const unfavoritedArticle = {
        ...article,
        userFavoriteIds: [],
        favoritesCount: 0,
        favorited: false,
      };

      mockArticleRepository.findOne.mockResolvedValue(article);
      mockArticleRepository.save.mockResolvedValue(unfavoritedArticle);

      const result = await service.unfavorite('test-article-123456', 1);

      expect(mockArticleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userFavoriteIds: [],
          favoritesCount: 0,
          favorited: false,
        }),
      );
      expect(result).toEqual(unfavoritedArticle);
    });

    it('should throw BadRequestException if article not favorited', async () => {
      const article = { ...mockArticle, userFavoriteIds: [] };

      mockArticleRepository.findOne.mockResolvedValue(article);
      mockI18nService.t.mockReturnValue('Article not favorited');

      await expect(
        service.unfavorite('test-article-123456', 1),
      ).rejects.toThrow(BadRequestException);
      expect(mockI18nService.t).toHaveBeenCalledWith('article.notFavorited');
    });

    it('should throw NotFoundException if article not found', async () => {
      mockArticleRepository.findOne.mockResolvedValue(null);
      mockI18nService.t.mockReturnValue('Article not found');

      await expect(service.unfavorite('non-existent-slug', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove only the specific user from favorites list', async () => {
      const article = {
        ...mockArticle,
        userFavoriteIds: [1, 2, 3],
        favoritesCount: 3,
        favorited: true,
      };

      mockArticleRepository.findOne.mockResolvedValue(article);
      mockArticleRepository.save.mockResolvedValue({
        ...article,
        userFavoriteIds: [1, 3],
        favoritesCount: 2,
      });

      await service.unfavorite('test-article-123456', 2);

      expect(mockArticleRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          userFavoriteIds: [1, 3],
          favoritesCount: 2,
          favorited: false,
        }),
      );
    });
  });

  describe('generateSlug (private method testing)', () => {
    it('should handle special characters in title', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test@#$%Article!',
        description: 'Test description',
        body: 'Test body',
      };

      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      await service.create(createArticleDto, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/^testarticle-\d+$/) as string,
        }),
      );
    });

    it('should handle title with multiple spaces', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test   Article   With    Spaces',
        description: 'Test description',
        body: 'Test body',
      };

      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      await service.create(createArticleDto, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(
            /^test-article-with-spaces-\d+$/,
          ) as string,
        }),
      );
    });

    it('should handle title with underscores', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test_Article_Title',
        description: 'Test description',
        body: 'Test body',
      };

      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      await service.create(createArticleDto, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/^test-article-title-\d+$/) as string,
        }),
      );
    });

    it('should trim leading and trailing spaces', async () => {
      const createArticleDto: CreateArticleDto = {
        title: '   Test Article   ',
        description: 'Test description',
        body: 'Test body',
      };

      mockArticleRepository.create.mockReturnValue(mockArticle);
      mockArticleRepository.save.mockResolvedValue(mockArticle);
      mockI18nService.t.mockReturnValue('Article created successfully');

      await service.create(createArticleDto, mockUser);

      expect(mockArticleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          slug: expect.stringMatching(/^test-article-\d+$/) as string,
        }),
      );
    });
  });
});
