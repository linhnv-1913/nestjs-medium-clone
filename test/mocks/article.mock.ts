import { Article } from 'src/articles/article.entity';
import { mockUser } from './user.mock';

export const mockArticle: Article = {
  id: 1,
  title: 'Test Article',
  description: 'Test description',
  body: 'Test body',
  slug: 'test-article-123456',
  tagList: ['test', 'article'],
  userFavoriteIds: [],
  favorited: false,
  favoritesCount: 0,
  author: mockUser,
  authorId: 1,
  comments: [],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
