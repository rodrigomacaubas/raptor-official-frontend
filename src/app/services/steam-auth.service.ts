// Alternativa: Se preferir manter tudo no Angular sem a página HTML
// src/app/services/steam-auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class SteamAuthService {
  private readonly http = inject(HttpClient);
  private readonly keycloak = inject(Keycloak);
  private readonly apiUrl = 'http://localhost:5000/api';

  /**
   * Processa o callback da Steam com autenticação
   */
  processSteamCallbackWithAuth(openidParams: any): Observable<any> {
    // Primeiro garante que temos um token válido
    return from(this.ensureValidToken()).pipe(
      switchMap(() => {
        // Agora faz a chamada com o token
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.keycloak.token}`
        });

        const payload = {
          openid_params: {
            'openid.ns': openidParams['openid.ns'],
            'openid.mode': 'check_authentication',
            'openid.op_endpoint': openidParams['openid.op_endpoint'],
            'openid.claimed_id': openidParams['openid.claimed_id'],
            'openid.identity': openidParams['openid.identity'],
            'openid.return_to': openidParams['openid.return_to'],
            'openid.response_nonce': openidParams['openid.response_nonce'],
            'openid.assoc_handle': openidParams['openid.assoc_handle'],
            'openid.signed': openidParams['openid.signed'],
            'openid.sig': openidParams['openid.sig']
          }
        };

        return this.http.post(`${this.apiUrl}/auth/steam_verify`, payload, { headers });
      })
    );
  }

  /**
   * Garante que o token Keycloak está válido
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.keycloak.authenticated) {
      throw new Error('User not authenticated');
    }

    // Verifica se o token vai expirar em breve (menos de 30 segundos)
    const needsRefresh = this.keycloak.isTokenExpired(30);
    
    if (needsRefresh) {
      console.log('Token needs refresh, refreshing...');
      await this.keycloak.updateToken(30);
    }
  }

  /**
   * Salva o estado do Steam callback antes de processar
   */
  saveSteamCallbackState(): void {
    const url = window.location.href;
    sessionStorage.setItem('steam_callback_state', JSON.stringify({
      url: url,
      timestamp: Date.now(),
      token: this.keycloak.token
    }));
  }

  /**
   * Recupera o estado do Steam callback
   */
  getSteamCallbackState(): any {
    const state = sessionStorage.getItem('steam_callback_state');
    if (state) {
      try {
        return JSON.parse(state);
      } catch (e) {
        console.error('Failed to parse steam callback state');
      }
    }
    return null;
  }
}