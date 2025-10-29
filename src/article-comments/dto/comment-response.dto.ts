import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

export class CommentResponseDto {
  @ApiProperty({ example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Great article! Thanks for sharing.' })
  @Expose()
  body: string;

  @ApiProperty({ type: () => UserResponseDto })
  @Expose()
  @Type(() => UserResponseDto)
  author: UserResponseDto;

  @ApiProperty({ example: '2025-10-28T10:00:00.000Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ example: '2025-10-28T10:00:00.000Z' })
  @Expose()
  updatedAt: Date;
}
