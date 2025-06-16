import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { KeycloakService } from 'keycloak-angular';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  
  constructor(
    private keycloakService: KeycloakService,
    private snackBar: MatSnackBar
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip interceptor for Keycloak URLs and assets
    if (req.url.includes('keycloak') || req.url.includes('/assets/')) {
      return next.handle(req);
    }

    // If user is not logged in, proceed without token
    if (!this.keycloakService.isLoggedIn()) {
      return next.handle(req);
    }

    // Get token and add to request
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${token}`)
        });
        
        return next.handle(authReq).pipe(
          catchError((error: HttpErrorResponse) => this.handleError(error))
        );
      }),
      catchError((error: any) => {
        console.error('Error getting token:', error);
        return next.handle(req).pipe(
          catchError((error: HttpErrorResponse) => this.handleError(error))
        );
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocorreu um erro inesperado';
    
    switch (error.status) {
      case 400:
        errorMessage = error.error?.error || 'Dados inválidos enviados';
        break;
      case 401:
        errorMessage = 'Sessão expirada. Faça login novamente';
        // Redirect to login
        this.keycloakService.login();
        break;
      case 403:
        errorMessage = 'Você não tem permissão para esta ação';
        break;
      case 404:
        errorMessage = 'Recurso não encontrado';
        break;
      case 409:
        errorMessage = error.error?.error || 'Conflito nos dados';
        break;
      case 422:
        errorMessage = error.error?.error || 'Dados de entrada inválidos';
        break;
      case 500:
        errorMessage = 'Erro interno do servidor. Tente novamente mais tarde';
        break;
      case 503:
        errorMessage = 'Serviço temporariamente indisponível';
        break;
      default:
        if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
    }

    // Show error message to user (except for 401 since we redirect)
    if (error.status !== 401) {
      this.snackBar.open(errorMessage, 'Fechar', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }

    console.error('HTTP Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      message: errorMessage
    });

    return throwError(() => ({
      ...error,
      userMessage: errorMessage
    }));
  }
}