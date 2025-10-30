import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { UpdateDto } from './dto/update.dto';
import { UploadService } from 'src/upload/upload.service';
import {
  DEFAULT_ORDER,
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from 'src/constants';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly i18n: I18nService,
    private readonly uploadService: UploadService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, username, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      username,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    return this.i18n.t('user.created');
  }

  async update(
    userId: number,
    updateDto: Partial<UpdateDto>,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.findOrFailUser(userId);

    if (file) {
      if (user.image) {
        this.uploadService.deleteImage(user.image);
      }

      const imageUrl = await this.uploadService.uploadImage(file);
      updateDto.image = imageUrl;
    }

    if (updateDto.password) {
      updateDto.password = await bcrypt.hash(updateDto.password, 10);
    }

    Object.assign(user, updateDto);

    return await this.userRepository.save(user);
  }

  async listUsers(
    page: number = DEFAULT_PAGINATION_PAGE,
    limit: number = DEFAULT_PAGINATION_LIMIT,
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: DEFAULT_ORDER },
    });

    return { users, total };
  }

  async findOrFailUser(idOrUsername: number | string): Promise<User> {
    const where =
      typeof idOrUsername === 'number'
        ? { id: idOrUsername }
        : { username: idOrUsername };

    const user = await this.userRepository.findOne({ where });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.notFound'));
    }

    return user;
  }
}
