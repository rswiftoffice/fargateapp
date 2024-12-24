import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { BadGatewayException, InternalServerErrorException } from '@nestjs/common/exceptions';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { isJson } from 'src/utils/isJSON';
import { removeKeyFromObject } from 'src/utils/removeKeyFromObject';

export interface Response<T> {
  data: T;
}

@Injectable()
export class FilteredResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const getData = (data: any) =>
          isJson(data) ? removeKeyFromObject(data, 'deleted') : data;

        if (Array.isArray(data)) {
          return data.map((item) => getData(item));
        }

        return getData(data);
      }),
      catchError(err => {
        if (err instanceof InternalServerErrorException) {
          return throwError(() => new InternalServerErrorException(err.message));
        }
        return throwError(() => err);
      }),
    );
  }
}
