// src/app/services/keycloak-initializer.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root'
})
export class KeycloakInitializerService {
  private readonly keycloak = inject(Keycloak);
  private readonly router = inject(Router);
  
  /**
   * Verifica se a URL atual é um callback especial que não deve ser processado pelo Keycloak
   */
  isSpecialCallback(): boolean {
    const url = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    
    // Verifica se é um callback da Steam
    const isSteamCallback = urlParams.has('openid.mode') && 
                           urlParams.has('openid.claimed_id') &&
                           url.includes('/steam-callback');
    
    if (isSteamCallback) {
      console.log('Steam callback detectado, ignorando processamento Keycloak');
      return true;
    }
    
    return false;
  }
  
  /**
   * Salva o estado atual antes do login
   */
  savePreLoginState(): void {
    const currentUrl = window.location.href;
    sessionStorage.setItem('pre_login_url', currentUrl);
  }
  
  /**
   * Restaura o estado após o login
   */
  restorePostLoginState(): void {
    const savedUrl = sessionStorage.getItem('pre_login_url');
    if (savedUrl && !savedUrl.includes('#state=')) {
      sessionStorage.removeItem('pre_login_url');
      window.location.href = savedUrl;
    }
  }
  
  /**
   * Verifica se deve processar a autenticação Keycloak
   */
  shouldProcessAuth(): boolean {
    // Se for um callback especial, não processa
    if (this.isSpecialCallback()) {
      return false;
    }
    
    // Se tiver parâmetros do Keycloak, processa
    const url = window.location.href;
    return url.includes('#state=') || url.includes('&code=');
  }
}