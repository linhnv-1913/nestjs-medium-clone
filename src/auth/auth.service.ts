import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/user.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalidEmailOrPassword'),
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18n.t('auth.invalidEmailOrPassword'),
      );
    }

    const tokenData = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      ...tokenData,
    };
  }

  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException(this.i18n.t('auth.userNotFound'));
    }

    return user;
  }

  private generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const token = this.jwtService.sign(payload);
    const expiresIn = Number(this.configService.get('JWT_EXPIRES_IN'));
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      expires_at: expiresAt.toISOString(),
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { id, username } = user;
    return { id, username };
  }
}
