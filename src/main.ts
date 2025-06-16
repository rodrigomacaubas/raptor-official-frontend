// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Função para verificar se é um callback especial ANTES de inicializar a aplicação
function isSpecialCallback(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Verifica se é um callback da Steam
  const isSteamCallback = urlParams.has('openid.mode') && 
                         urlParams.has('openid.claimed_id') &&
                         window.location.pathname === '/steam-callback';
  
  return isSteamCallback;
}

// Se for um callback especial, preserva a URL
if (isSpecialCallback()) {
  console.log('Special callback detected, preserving URL');
  // Salva a URL atual antes que o Keycloak possa modificá-la
  sessionStorage.setItem('steam_callback_url', window.location.href);
}

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));