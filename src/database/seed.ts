import dataSource from './data-source';
import { User } from '../users/user.entity';
import { Article } from '../articles/article.entity';

async function seed() {
  try {
    // Khởi tạo kết nối database
    await dataSource.initialize();
    console.log('Database connection established');

    // Lấy repositories
    const userRepository = dataSource.getRepository(User);
    const articleRepository = dataSource.getRepository(Article);

    // Seed users
    const users = await userRepository.save([
      {
        email: 'user1@example.com',
        username: 'user1',
        password: 'password123',
      },
      {
        email: 'user2@example.com',
        username: 'user2',
        password: 'password123',
      },
    ]);
    console.log('Users seeded:', users.length);

    // Seed articles
    const articles = await articleRepository.save([
      {
        title: 'First Article',
        description: 'Description of first article',
        body: 'Body content of first article',
        author: users[0],
      },
      {
        title: 'Second Article',
        description: 'Description of second article',
        body: 'Body content of second article',
        author: users[1],
      },
    ]);
    console.log('Articles seeded:', articles.length);

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
    throw error;
  } finally {
    // Đóng kết nối database
    await dataSource.destroy();
    console.log('Database connection closed');
  }
}

// Chạy seed
seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
