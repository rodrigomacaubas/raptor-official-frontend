// src/app/keycloak/keycloak-init.factory.ts
import Keycloak from 'keycloak-js';

export function initializeKeycloak(keycloak: Keycloak): () => Promise<boolean> {
  return () => new Promise((resolve, reject) => {
    // Verifica se é um callback especial que não deve ser processado
    const urlParams = new URLSearchParams(window.location.search);
    const isSteamCallback = urlParams.has('openid.mode') && 
                           urlParams.has('openid.claimed_id') &&
                           window.location.pathname === '/steam-callback';
    
    if (isSteamCallback) {
      console.log('Steam callback detected - bypassing Keycloak init');
      // Não inicializa o Keycloak para callbacks especiais
      resolve(true);
      return;
    }
    
    // Configuração normal do Keycloak
    keycloak.init({
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      enableLogging: true
    })
    .then((authenticated) => {
      console.log('Keycloak initialized, authenticated:', authenticated);
      resolve(authenticated);
    })
    .catch((error) => {
      console.error('Keycloak init error:', error);
      reject(error);
    });
  });
}