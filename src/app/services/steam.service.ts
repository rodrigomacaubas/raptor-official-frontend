// src/app/services/steam.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { ApiService, SteamId, SteamVerifyResponse, ApiResponse } from './api.service';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class SteamService {
  private readonly apiService = inject(ApiService);
  private readonly keycloak = inject(Keycloak);
  
  private steamIdsSubject = new BehaviorSubject<SteamId[]>([]);
  public steamIds$ = this.steamIdsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  /**
   * Carrega todos os SteamIDs do usuário
   */
  loadUserSteamIds(): Observable<SteamId[]> {
    this.loadingSubject.next(true);
    
    return this.apiService.getUserSteamIds().pipe(
      map(response => response.steam_ids || []),
      tap(steamIds => {
        this.steamIdsSubject.next(steamIds);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Erro ao carregar SteamIDs:', error);
        throw error;
      })
    );
  }

  /**
   * Obtém a URL de login do Steam
   */
  getSteamLoginUrl(): Observable<string> {
    // Usa uma página HTML estática para evitar interferência do Keycloak
    const redirectUri = window.location.origin + '/assets/steam-callback.html';
    
    return this.apiService.getSteamLoginUrl(redirectUri).pipe(
      map(response => response.steam_login_url),
      tap(url => {
        console.log('Steam login URL gerada:', url);
        // Tenta salvar o token atual de várias formas para a página HTML usar
        this.saveTokenForCallback();
      })
    );
  }
  
  /**
   * Salva o token de autenticação para uso no callback
   */
  private saveTokenForCallback(): void {
    // Tenta obter o token do Keycloak
    if (this.keycloak.token) {
      sessionStorage.setItem('kc_token', this.keycloak.token);
      console.log('Token saved for callback');
      
      // Debug: mostra onde o token está sendo salvo
      this.debugTokenStorage();
    } else {
      console.warn('No Keycloak token available');
    }
  }
  
  /**
   * Debug: mostra onde os tokens estão armazenados
   */
  private debugTokenStorage(): void {
    console.group('Token Storage Debug');
    
    // Verifica localStorage
    console.log('LocalStorage keys:', Object.keys(localStorage));
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      if (value && value.includes('eyJ')) {
        console.log(`Token found in localStorage[${key}]:`, value.substring(0, 50) + '...');
      }
    });
    
    // Verifica sessionStorage
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    Object.keys(sessionStorage).forEach(key => {
      const value = sessionStorage.getItem(key);
      if (value && value.includes('eyJ')) {
        console.log(`Token found in sessionStorage[${key}]:`, value.substring(0, 50) + '...');
      }
    });
    
    // Mostra o token do Keycloak diretamente
    console.log('Keycloak token:', this.keycloak.token?.substring(0, 50) + '...');
    
    console.groupEnd();
  }

  /**
   * Define um SteamID como padrão
   */
  setDefaultSteamId(steamId: string): Observable<ApiResponse> {
    return this.apiService.setDefaultSteamId(steamId).pipe(
      tap(response => {
        console.log('SteamID definido como padrão:', steamId);
        // Atualiza a lista local
        const currentIds = this.steamIdsSubject.value;
        const updatedIds = currentIds.map(id => ({
          ...id,
          is_default: id.steamid64 === steamId
        }));
        this.steamIdsSubject.next(updatedIds);
      })
    );
  }

  /**
   * Remove um SteamID
   */
  deleteSteamId(steamId: string): Observable<ApiResponse> {
    return this.apiService.deleteSteamId(steamId).pipe(
      tap(response => {
        console.log('SteamID removido:', steamId);
        // Remove da lista local
        const currentIds = this.steamIdsSubject.value;
        const updatedIds = currentIds.filter(id => id.steamid64 !== steamId);
        this.steamIdsSubject.next(updatedIds);
      })
    );
  }

  /**
   * Verifica se há parâmetros Steam na URL atual
   */
  checkForSteamCallback(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('openid.mode') && urlParams.has('openid.claimed_id');
  }

  /**
   * Processa o callback da Steam
   */
  processSteamCallback(): Observable<SteamVerifyResponse> {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (!this.checkForSteamCallback()) {
      return throwError(() => new Error('Nenhum callback Steam detectado'));
    }

    // Extrai todos os parâmetros openid.*
    const openidParams: { [key: string]: string } = {};
    urlParams.forEach((value, key) => {
      if (key.startsWith('openid.')) {
        openidParams[key] = value;
      }
    });

    // Verifica parâmetros obrigatórios
    if (!openidParams['openid.signed'] || !openidParams['openid.sig']) {
      return throwError(() => new Error('Parâmetros OpenID incompletos'));
    }

    // Prepara o payload exatamente como o backend espera
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

    return this.apiService.verifySteamLogin(payload).pipe(
      tap(() => {
        // Recarrega os Steam IDs após sucesso
        this.loadUserSteamIds().subscribe();
      }),
      catchError(error => {
        console.error('Erro na verificação Steam:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Limpa os parâmetros Steam da URL
   */
  clearSteamParams(): void {
    const url = new URL(window.location.href);
    const params = url.searchParams;
    
    // Remove todos os parâmetros openid
    const openidParams = Array.from(params.keys()).filter(key => key.startsWith('openid.'));
    openidParams.forEach(param => params.delete(param));
    
    // Remove parâmetro de callback
    params.delete('steam_callback');
    
    // Atualiza a URL sem recarregar a página
    window.history.replaceState({}, '', url.pathname + (params.toString() ? '?' + params.toString() : ''));
  }

  /**
   * Obtém o SteamID padrão do usuário
   */
  getDefaultSteamId(): SteamId | null {
    const steamIds = this.steamIdsSubject.value;
    return steamIds.find(id => id.is_default) || null;
  }

  /**
   * Verifica se o usuário tem SteamIDs vinculados
   */
  hasSteamIds(): boolean {
    return this.steamIdsSubject.value.length > 0;
  }
}