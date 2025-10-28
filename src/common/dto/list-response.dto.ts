import { ApiProperty } from '@nestjs/swagger';

export function createListResponseDto<T>(
  itemType: new () => T,
  fieldName: string,
) {
  class ListResponse {
    @ApiProperty({ type: [itemType] })
    [fieldName]: T[];

    @ApiProperty({ example: 50 })
    total: number;
  }

  Object.defineProperty(ListResponse, 'name', {
    value: `ListResponseDto<${itemType.name}>`,
  });

  return ListResponse;
}
