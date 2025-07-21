import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    retry({ count: 1, delay: 1000 }), // Retry once after 1 second on error
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        // Client-side errors
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side errors
        if (error.status) {
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      console.error(errorMessage);
      return throwError(() => new Error(errorMessage));
    })
  );
};
