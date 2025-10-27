import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { UpdateDto } from './dto/update.dto';
import { UploadService } from 'src/upload/upload.service';

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
    const user = await this.findUserOrFail(userId);

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

  private async findUserOrFail(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(this.i18n.t('user.notFound'));
    }

    return user;
  }
}
