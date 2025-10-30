import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth-guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from './user.entity';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from './users.service';
import { UpdateDto } from './dto/update.dto';
import { IMAGE_FILE_TYPE, IMAGE_MAX_SIZE } from 'src/constants';
import {
  ErrorResponse,
  SuccessResponse,
} from '../common/decorators/response.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { ListRequestDto } from '../common/dto/list-request.dto';
import { createListResponseDto } from '../common/dto/list-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse(SuccessResponse(201, 'User created'))
  @ApiResponse(ErrorResponse(409, 'Email has already been taken'))
  @ApiResponse(ErrorResponse(400, 'Validation error'))
  async register(@Body() registerDto: RegisterDto) {
    return this.usersService.register(registerDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse(
    SuccessResponse(200, 'Profile retrieved successfully', UserResponseDto),
  )
  getProfile(@CurrentUser() user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      bio: user.bio,
      image: user.image,
    };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse(SuccessResponse(200, 'User updated'))
  @ApiResponse(ErrorResponse(404, 'User not found'))
  @ApiResponse(ErrorResponse(409, 'Email has already been taken'))
  @ApiResponse(ErrorResponse(400, 'Validation error'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateDto })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
    }),
  )
  async update(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: IMAGE_MAX_SIZE }),
          new FileTypeValidator({ fileType: IMAGE_FILE_TYPE }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.usersService.update(user.id, updateDto, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse(
    SuccessResponse(
      200,
      'Users retrieved successfully',
      createListResponseDto(UserResponseDto, 'users'),
    ),
  )
  async listUsers(@Query() ListRequestDto: ListRequestDto) {
    return this.usersService.listUsers(
      ListRequestDto.page,
      ListRequestDto.limit,
    );
  }
}
