import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Keycloak from 'keycloak-js';

// Tipos importados de arquivo centralizado (opcional - pode manter aqui se preferir)
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: string;
}

export interface SteamLoginUrlResponse {
  steam_login_url: string;
}

export interface SteamVerifyRequest {
    openid_params: {
        'openid.ns': string;
        'openid.mode': string;  // Adicionado explicitamente
        'openid.op_endpoint': string;
        'openid.claimed_id': string;
        'openid.identity': string;
        'openid.return_to': string;
        'openid.response_nonce': string;
        'openid.assoc_handle': string;
        'openid.signed': string;
        'openid.sig': string;
    };
}

export interface SteamVerifyResponse {
  message: string;
  steamid64: string;
  is_default?: boolean;
  status: 'created' | 'existing' | 'conflict';
}

export interface SteamId {
  steamid64: string;
  is_default: boolean;
  linked_at: string;
}

export interface UserSteamIdsResponse {
  steam_ids: SteamId[];
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:5000/api'; // Ajuste conforme necessário
  private readonly http = inject(HttpClient);
  private readonly keycloak = inject(Keycloak);

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    
    // Se for erro 401, pode forçar novo login
    if (error.status === 401 && this.keycloak.authenticated) {
      this.keycloak.login();
    }
    
    return throwError(() => error);
  }

  // Generic HTTP methods
  // Nota: Com o interceptor configurado, não precisamos mais adicionar manualmente o token
  get<T>(endpoint: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params })
      .pipe(catchError(error => this.handleError(error)));
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(error => this.handleError(error)));
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(error => this.handleError(error)));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(error => this.handleError(error)));
  }

  // Steam-specific methods
  getSteamLoginUrl(redirectUri: string): Observable<SteamLoginUrlResponse> {
    const params = new HttpParams().set('redirect_uri', redirectUri);
    return this.get<SteamLoginUrlResponse>('/auth/steam_url', params);
  }

  verifySteamLogin(openidParams: any): Observable<SteamVerifyResponse> {
    const body: SteamVerifyRequest = { openid_params: openidParams };
    return this.post<SteamVerifyResponse>('/auth/steam_verify', body);
  }

  getUserSteamIds(): Observable<UserSteamIdsResponse> {
    return this.get<UserSteamIdsResponse>('/user/steam_ids');
  }

  setDefaultSteamId(steamId: string): Observable<ApiResponse> {
    return this.get<ApiResponse>(`/user/steamid/${steamId}/set_default`);
  }

  deleteSteamId(steamId: string): Observable<ApiResponse> {
    return this.delete<ApiResponse>(`/user/steam_ids/${steamId}`);
  }

  // User profile methods (for future use)
  getUserProfile(): Observable<any> {
    return this.get('/user/profile');
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.put('/user/profile', profileData);
  }

  // Economy methods (for future use)
  getUserBalance(): Observable<any> {
    return this.get('/user/balance');
  }

  transferCurrency(transferData: any): Observable<any> {
    return this.post('/transfer', transferData);
  }

  getTransactionHistory(): Observable<any> {
    return this.get('/user/transactions');
  }
}