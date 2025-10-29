import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment body',
    example: 'Great article! Thanks for sharing.',
  })
  @IsNotEmpty()
  @IsString()
  body: string;
}
