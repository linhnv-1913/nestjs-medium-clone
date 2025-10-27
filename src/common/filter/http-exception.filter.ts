import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { PSQL_UNIQUE_VIOLATION_CODE } from 'src/constants';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly i18n: I18nService<Record<string, unknown>>) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = exceptionResponse.message as string;
      } else {
        message = exceptionResponse;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      const error = exception as QueryFailedError & {
        code?: string;
        detail?: string;
        constraint?: string;
        table?: string;
        column?: string;
      };

      if (error.code === PSQL_UNIQUE_VIOLATION_CODE) {
        status = HttpStatus.CONFLICT;

        const detail = error.detail || '';
        const constraintMatch = detail.match(/Key \((\w+)\)/);
        const columnName = constraintMatch ? constraintMatch[1] : error.column;
        const tableName = error.table;

        const translationKey = `${tableName}.duplicate_${columnName}`;
        message = this.i18n.t(translationKey, {
          defaultValue: this.i18n.t('common.duplicateEntry'),
        });
      } else {
        message = 'Bad request';
        this.logger.error('Database error:', exception);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
