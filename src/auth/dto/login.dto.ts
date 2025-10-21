import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('auth.validation.emailInvalid'),
    },
  )
  @IsNotEmpty({
    message: i18nValidationMessage('auth.validation.emailRequired'),
  })
  email!: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'User password',
  })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('auth.validation.passwordRequired'),
  })
  password!: string;
}
