import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_MIN_LENGTH, USERNAME_MAX_LENGTH } from 'src/constants';

export class UpdateDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('auth.validation.emailInvalid'),
    },
  )
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'johndoe',
    maxLength: USERNAME_MAX_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: i18nValidationMessage('auth.validation.usernameTooLong', {
      maxLength: USERNAME_MAX_LENGTH,
    }),
  })
  username?: string;

  @ApiPropertyOptional({
    example: 'Password123!',
    minLength: PASSWORD_MIN_LENGTH,
  })
  @IsString()
  @IsOptional()
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: i18nValidationMessage('auth.validation.passwordTooShort', {
      minLength: PASSWORD_MIN_LENGTH,
    }),
  })
  password?: string;

  @ApiPropertyOptional({
    example: 'My bio',
    description: 'User biography',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile image file',
  })
  @IsOptional()
  image?: any;
}
