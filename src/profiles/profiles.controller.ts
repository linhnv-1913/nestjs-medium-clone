import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ProfileResponseDto } from './dto/profile-response.dto';
import {
  SuccessResponse,
  ErrorResponse,
} from 'src/common/decorators/response.decorator';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user profile by username' })
  @ApiResponse(
    SuccessResponse(200, 'Profile retrieved successfully', ProfileResponseDto),
  )
  @ApiResponse(ErrorResponse(404, 'User not found'))
  async getProfile(
    @CurrentUser() currentUser: User,
    @Param('username') username: string,
  ): Promise<ProfileResponseDto> {
    return await this.profilesService.getProfile(currentUser.id, username);
  }

  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse(
    SuccessResponse(201, 'Follow user successfully', ProfileResponseDto),
  )
  @ApiResponse(ErrorResponse(404, 'User not found'))
  @ApiResponse(ErrorResponse(400, 'You are already following this user'))
  @ApiResponse(ErrorResponse(409, 'You cannot follow yourself'))
  async followUser(
    @CurrentUser() currentUser: User,
    @Param('username') username: string,
  ): Promise<ProfileResponseDto> {
    return await this.profilesService.followUserByUsername(
      currentUser.id,
      username,
    );
  }

  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse(
    SuccessResponse(200, 'Unfollow user successfully', ProfileResponseDto),
  )
  @ApiResponse(ErrorResponse(404, 'User not found'))
  @ApiResponse(ErrorResponse(400, 'You are not following this user'))
  async unfollowUser(
    @CurrentUser() currentUser: User,
    @Param('username') username: string,
  ): Promise<ProfileResponseDto> {
    return await this.profilesService.unfollowUserByUsername(
      currentUser.id,
      username,
    );
  }
}
