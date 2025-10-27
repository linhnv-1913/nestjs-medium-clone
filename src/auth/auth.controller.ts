import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  ErrorResponse,
  SuccessResponse,
} from '../common/decorators/response.decorator';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login' })
  @ApiResponse(SuccessResponse(200, 'Login successful', AuthResponseDto))
  @ApiResponse(ErrorResponse(401, 'Invalid email or password'))
  @ApiResponse(ErrorResponse(400, 'Validation error'))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
