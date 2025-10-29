import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserFollow } from './user-follow.entity';
import { User } from '../users/user.entity';
import { I18nService } from 'nestjs-i18n';
import { UsersService } from '../users/users.service';
import { ProfileResponseDto } from './dto/profile-response.dto';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(UserFollow)
    private readonly followerRepository: Repository<UserFollow>,
    private readonly i18n: I18nService,
    private readonly usersService: UsersService,
  ) {}

  async getProfile(
    currentUserId: number,
    username: string,
  ): Promise<ProfileResponseDto> {
    const user = await this.usersService.findOrFailUser(username);
    const following = currentUserId
      ? await this.isFollowing(currentUserId, user.id)
      : false;

    return new ProfileResponseDto(user, following);
  }

  async followUserByUsername(
    currentUserId: number,
    username: string,
  ): Promise<ProfileResponseDto> {
    const userToFollow = await this.usersService.findOrFailUser(username);
    await this.follow(currentUserId, userToFollow.id);

    return new ProfileResponseDto(userToFollow, true);
  }

  async unfollowUserByUsername(
    currentUserId: number,
    username: string,
  ): Promise<ProfileResponseDto> {
    const userToUnfollow = await this.usersService.findOrFailUser(username);
    await this.unfollow(currentUserId, userToUnfollow.id);

    return new ProfileResponseDto(userToUnfollow, false);
  }

  private async follow(followerId: number, followingId: number): Promise<void> {
    if (followerId === followingId) {
      throw new ConflictException(this.i18n.t('user_follow.cannotFollowSelf'));
    }

    const existingFollow = await this.isFollowing(followerId, followingId);
    if (existingFollow) {
      throw new BadRequestException(
        this.i18n.t('user_follow.alreadyFollowing'),
      );
    }

    const follow = this.followerRepository.create({
      follower: { id: followerId } as User,
      following: { id: followingId } as User,
    });

    await this.followerRepository.save(follow);
  }

  private async unfollow(
    followerId: number,
    followingId: number,
  ): Promise<void> {
    const follow = await this.followerRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (!follow) {
      throw new BadRequestException(this.i18n.t('user_follow.notFollowing'));
    }

    await this.followerRepository.remove(follow);
  }

  private async isFollowing(
    followerId: number,
    followingId: number,
  ): Promise<boolean> {
    const follow = await this.followerRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    return !!follow;
  }
}
