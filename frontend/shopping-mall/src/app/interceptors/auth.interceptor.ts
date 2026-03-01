import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.tokenValue;
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    // Debug logging to help diagnose 401/500 from backend during development
    try {
      const auth = request.headers.get('Authorization');
      // eslint-disable-next-line no-console
      console.debug(
        '[AuthInterceptor] ->',
        request.method,
        request.url,
        'Authorization=',
        auth ? '[REDACTED]' : auth,
      );
    } catch (e) {
      // ignore
    }

    return next.handle(request);
  }
}
