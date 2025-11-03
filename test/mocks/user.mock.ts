import { User } from 'src/users/user.entity';

export const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  bio: 'Test bio',
  image: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

export const mockUser2: User = {
  id: 2,
  email: 'test2@example.com',
  username: 'testuser2',
  password: 'hashedpassword2',
  bio: 'Test bio 2',
  image: '',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
