import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/user.entity';

class ProfileDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  image: string;

  @ApiProperty()
  following: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({ type: ProfileDto })
  profile: ProfileDto;

  constructor(user: User, following: boolean) {
    this.profile = {
      username: user.username,
      bio: user.bio,
      image: user.image,
      following,
    };
  }
}
