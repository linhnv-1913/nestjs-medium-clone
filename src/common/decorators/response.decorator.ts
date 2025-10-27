import { ApiResponseOptions } from '@nestjs/swagger';
import { Type } from '@nestjs/common';

export const ErrorResponse = (
  status: number,
  description: string,
): ApiResponseOptions => {
  return {
    status,
    description,
    schema: {
      example: {
        statusCode: status,
        message: description,
        timestamp: new Date().toISOString(),
      },
    },
  };
};

export const SuccessResponse = <T extends object>(
  status: number,
  description: string,
  type?: Type<T>,
): ApiResponseOptions => {
  return {
    status,
    description,
    type: type,
  };
};
