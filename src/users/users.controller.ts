import { Controller, Get } from '@nestjs/common';

@Controller('api/users')
export class UsersController {
  @Get()
  getUser() {
    return 'Get user';
  }
}
