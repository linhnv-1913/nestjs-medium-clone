import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ListRequestDto } from 'src/common/dto/list-request.dto';
import { mockArticle, mockUser, mockUser2 } from '../../test/mocks';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';

describe('ArticlesController', () => {
  let controller: ArticlesController;

  const mockArticlesService = {
    create: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    listArticles: jest.fn(),
    delete: jest.fn(),
    favorite: jest.fn(),
    unfavorite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ArticlesController>(ArticlesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('JWT Authentication Guard', () => {
    type GuardType = { name: string };

    const getGuardsForMethod = (
      method: keyof ArticlesController,
    ): GuardType[] => {
      return (
        (Reflect.getMetadata(
          '__guards__',
          ArticlesController.prototype[method],
        ) as GuardType[]) || []
      );
    };

    const hasJwtAuthGuard = (guards: GuardType[]): boolean => {
      return guards.some((guard) => guard.name === 'JwtAuthGuard');
    };

    it('should have JwtAuthGuard applied to create endpoint', () => {
      const guards = getGuardsForMethod('create');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should have JwtAuthGuard applied to findBySlug endpoint', () => {
      const guards = getGuardsForMethod('findBySlug');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should have JwtAuthGuard applied to update endpoint', () => {
      const guards = getGuardsForMethod('update');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should have JwtAuthGuard applied to listArticles endpoint', () => {
      const guards = getGuardsForMethod('listArticles');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should have JwtAuthGuard applied to delete endpoint', () => {
      const guards = getGuardsForMethod('delete');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should have JwtAuthGuard applied to favorite endpoint', () => {
      const guards = getGuardsForMethod('favorite');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should have JwtAuthGuard applied to unfavorite endpoint', () => {
      const guards = getGuardsForMethod('unfavorite');
      expect(hasJwtAuthGuard(guards)).toBe(true);
    });

    it('should verify all endpoints require authentication', () => {
      const methods: (keyof ArticlesController)[] = [
        'create',
        'findBySlug',
        'update',
        'listArticles',
        'delete',
        'favorite',
        'unfavorite',
      ];

      methods.forEach((method) => {
        const guards = getGuardsForMethod(method);
        expect(guards).toBeDefined();
        expect(guards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test Article',
        description: 'Test description',
        body: 'Test body',
        tagList: ['test'],
      };

      mockArticlesService.create.mockResolvedValue('Article created');

      const result = await controller.create(createArticleDto, mockUser);

      expect(mockArticlesService.create).toHaveBeenCalledWith(
        createArticleDto,
        mockUser,
      );
      expect(result).toBe('Article created');
    });

    it('should call service.create with correct parameters', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Another Test Article',
        description: 'Another description',
        body: 'Another body',
      };

      mockArticlesService.create.mockResolvedValue(mockArticle);

      await controller.create(createArticleDto, mockUser);

      expect(mockArticlesService.create).toHaveBeenCalledTimes(1);
      expect(mockArticlesService.create).toHaveBeenCalledWith(
        createArticleDto,
        mockUser,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return an article by slug', async () => {
      const slug = 'test-article-123456';
      mockArticlesService.findBySlug.mockResolvedValue(mockArticle);

      const result = await controller.findBySlug(slug);

      expect(mockArticlesService.findBySlug).toHaveBeenCalledWith(slug);
      expect(result).toEqual(mockArticle);
    });

    it('should call service.findBySlug with correct slug', async () => {
      const slug = 'another-slug-789';
      mockArticlesService.findBySlug.mockResolvedValue(mockArticle);

      await controller.findBySlug(slug);

      expect(mockArticlesService.findBySlug).toHaveBeenCalledTimes(1);
      expect(mockArticlesService.findBySlug).toHaveBeenCalledWith(slug);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const slug = 'test-article-123456';
      const updateArticleDto: UpdateArticleDto = {
        title: 'Updated Title',
        description: 'Updated description',
      };

      const updatedArticle = { ...mockArticle, ...updateArticleDto };
      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const result = await controller.update(updateArticleDto, slug, mockUser);

      expect(mockArticlesService.update).toHaveBeenCalledWith(
        updateArticleDto,
        slug,
        mockUser,
      );
      expect(result).toEqual(updatedArticle);
    });

    it('should call service.update with correct parameters', async () => {
      const slug = 'test-slug';
      const updateArticleDto: UpdateArticleDto = {
        body: 'Updated body',
      };

      mockArticlesService.update.mockResolvedValue(mockArticle);

      await controller.update(updateArticleDto, slug, mockUser);

      expect(mockArticlesService.update).toHaveBeenCalledTimes(1);
      expect(mockArticlesService.update).toHaveBeenCalledWith(
        updateArticleDto,
        slug,
        mockUser,
      );
    });
  });

  describe('listArticles', () => {
    it('should return paginated list of articles with default values', async () => {
      const listRequestDto: ListRequestDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        articles: [mockArticle],
        total: 1,
      };

      mockArticlesService.listArticles.mockResolvedValue(expectedResult);

      const result = await controller.listArticles(listRequestDto);

      expect(mockArticlesService.listArticles).toHaveBeenCalledWith(
        listRequestDto.page,
        listRequestDto.limit,
      );
      expect(result).toEqual(expectedResult);
    });

    it('should return paginated list with custom page and limit', async () => {
      const listRequestDto: ListRequestDto = {
        page: 2,
        limit: 20,
      };

      const expectedResult = {
        articles: [mockArticle],
        total: 50,
      };

      mockArticlesService.listArticles.mockResolvedValue(expectedResult);

      const result = await controller.listArticles(listRequestDto);

      expect(mockArticlesService.listArticles).toHaveBeenCalledWith(2, 20);
      expect(result).toEqual(expectedResult);
    });

    it('should handle empty list', async () => {
      const listRequestDto: ListRequestDto = {
        page: 1,
        limit: 10,
      };

      const expectedResult = {
        articles: [],
        total: 0,
      };

      mockArticlesService.listArticles.mockResolvedValue(expectedResult);

      const result = await controller.listArticles(listRequestDto);

      expect(mockArticlesService.listArticles).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('delete', () => {
    it('should delete an article', async () => {
      const slug = 'test-article-123456';
      mockArticlesService.delete.mockResolvedValue(mockArticle);

      const result = await controller.delete(slug, mockUser);

      expect(mockArticlesService.delete).toHaveBeenCalledWith(slug, mockUser);
      expect(result).toEqual(mockArticle);
    });

    it('should call service.delete with correct parameters', async () => {
      const slug = 'article-to-delete';
      mockArticlesService.delete.mockResolvedValue(mockArticle);

      await controller.delete(slug, mockUser2);

      expect(mockArticlesService.delete).toHaveBeenCalledTimes(1);
      expect(mockArticlesService.delete).toHaveBeenCalledWith(slug, mockUser2);
    });
  });

  describe('favorite', () => {
    it('should favorite an article', async () => {
      const slug = 'test-article-123456';
      const favoritedArticle = {
        ...mockArticle,
        favorited: true,
        favoritesCount: 1,
      };

      mockArticlesService.favorite.mockResolvedValue(favoritedArticle);

      const result = await controller.favorite(slug, mockUser);

      expect(mockArticlesService.favorite).toHaveBeenCalledWith(
        slug,
        mockUser.id,
      );
      expect(result).toEqual(favoritedArticle);
    });

    it('should pass user id to service.favorite', async () => {
      const slug = 'another-article';
      mockArticlesService.favorite.mockResolvedValue(mockArticle);

      await controller.favorite(slug, mockUser2);

      expect(mockArticlesService.favorite).toHaveBeenCalledWith(
        slug,
        mockUser2.id,
      );
    });
  });

  describe('unfavorite', () => {
    it('should unfavorite an article', async () => {
      const slug = 'test-article-123456';
      const unfavoritedArticle = {
        ...mockArticle,
        favorited: false,
        favoritesCount: 0,
      };

      mockArticlesService.unfavorite.mockResolvedValue(unfavoritedArticle);

      const result = await controller.unfavorite(slug, mockUser);

      expect(mockArticlesService.unfavorite).toHaveBeenCalledWith(
        slug,
        mockUser.id,
      );
      expect(result).toEqual(unfavoritedArticle);
    });

    it('should pass user id to service.unfavorite', async () => {
      const slug = 'another-article';
      mockArticlesService.unfavorite.mockResolvedValue(mockArticle);

      await controller.unfavorite(slug, mockUser2);

      expect(mockArticlesService.unfavorite).toHaveBeenCalledWith(
        slug,
        mockUser2.id,
      );
    });
  });

  describe('integration with service', () => {
    it('should handle service errors properly', async () => {
      const createArticleDto: CreateArticleDto = {
        title: 'Test',
        description: 'Test',
        body: 'Test',
      };

      mockArticlesService.create.mockRejectedValue(new Error('Service error'));

      await expect(
        controller.create(createArticleDto, mockUser),
      ).rejects.toThrow('Service error');
    });

    it('should propagate service responses correctly', async () => {
      const slug = 'test-slug';
      const serviceResponse = { success: true, data: mockArticle };

      mockArticlesService.findBySlug.mockResolvedValue(serviceResponse);

      const result = await controller.findBySlug(slug);

      expect(result).toEqual(serviceResponse);
    });
  });
});
