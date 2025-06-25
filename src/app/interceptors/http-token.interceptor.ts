// src/app/interceptors/http-token.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap, catchError } from 'rxjs';
import Keycloak from 'keycloak-js';

export const httpTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const keycloak = inject(Keycloak);
  
  // URLs que não precisam de autenticação
  const excludedUrls = [
    '/assets/',
    'keycloak',
    '.json'
  ];
  
  // Verifica se a URL deve ser excluída
  const shouldExclude = excludedUrls.some(url => req.url.includes(url));
  
  if (shouldExclude || !keycloak.authenticated) {
    return next(req);
  }
  
  // Adiciona o token às requisições
  return from(keycloak.updateToken(30)).pipe(
    switchMap(() => {
      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${keycloak.token}`
        }
      });
      return next(authReq);
    }),
    catchError((error) => {
      console.error('Erro ao adicionar token:', error);
      return next(req);
    })
  );
};