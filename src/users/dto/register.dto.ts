import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH } from 'src/constants';

export class RegisterDto {
  @ApiProperty({
    example: 'user@example.com',
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
    example: 'johndoe',
    maxLength: USERNAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('auth.validation.usernameRequired'),
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: i18nValidationMessage('auth.validation.usernameTooLong'),
  })
  username!: string;

  @ApiProperty({
    example: 'Password123!',
    minLength: PASSWORD_MIN_LENGTH,
  })
  @IsString()
  @IsNotEmpty({
    message: i18nValidationMessage('auth.validation.passwordRequired'),
  })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: i18nValidationMessage('auth.validation.passwordTooShort'),
  })
  password!: string;
}
