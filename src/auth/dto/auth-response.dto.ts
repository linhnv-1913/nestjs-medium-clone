import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'johndoe' })
  username!: string;
}

export class AuthResponseDto {
  @ApiProperty({ type: UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token!: string;

  @ApiProperty({ example: 'Bearer' })
  token_type!: string;

  @ApiProperty({
    example: 3600,
    description: 'Token expiration time in seconds',
  })
  expires_in!: number;

  @ApiProperty({
    example: '2025-10-20T15:00:00.000Z',
    description: 'Token expiration timestamp in ISO format',
  })
  expires_at!: string;
}
