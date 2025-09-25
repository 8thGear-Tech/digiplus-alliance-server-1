/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// import {
//   ArgumentsHost,
//   Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus,
//   Logger,
// } from '@nestjs/common';
// import { HttpAdapterHost } from '@nestjs/core';

// /**
//  * Catches all exceptions thrown by the application and sends an appropriate HTTP response.
//  */
// @Catch()
// export class AllExceptionsFilter implements ExceptionFilter {
//   private readonly logger = new Logger(AllExceptionsFilter.name);

//   /**
//    * Creates an instance of `AllExceptionsFilter`.
//    *
//    * @param {HttpAdapterHost} httpAdapterHost - the HTTP adapter host
//    */
//   constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

//   /**
//    * Catches an exception and sends an appropriate HTTP response.
//    *
//    * @param {*} exception - the exception to catch
//    * @param {ArgumentsHost} host - the arguments host
//    * @returns {void}
//    */
//   catch(exception: any, host: ArgumentsHost): void {
//     this.logger.error(exception);

//     const { httpAdapter } = this.httpAdapterHost;

//     const ctx = host.switchToHttp();

//     const httpStatus =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;

//     const responseBody = {
//       error: exception.code,
//       message: exception.message,
//       description: exception.description,
//     };

//     httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
//   }
// }

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof MongoError) {
      // Handle Mongo errors
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT;
        message = exception.message.includes('emailAddress')
          ? 'Email address has already been used'
          : 'Duplicate key error';
      }
    } else if (exception instanceof SyntaxError) {
      // Handle invalid JSON in request
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid JSON format in request body';
    } else if (
      (exception as any).status &&
      (exception as any).response?.message
    ) {
      // Handle NestJS HttpException
      status = (exception as any).status;
      message = (exception as any).response.message;
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
