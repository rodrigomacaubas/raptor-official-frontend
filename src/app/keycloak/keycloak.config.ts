// src/app/keycloak/keycloak.config.ts
import {
  provideKeycloak,
  createInterceptorCondition,
  IncludeBearerTokenCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  withAutoRefreshToken,
  AutoRefreshTokenService,
  UserActivityService
} from 'keycloak-angular';

// Configuração para incluir o token apenas nas requisições para o backend
const backendCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  // Ajuste este padrão para corresponder ao URL do seu backend
  urlPattern: /^(http:\/\/192\.168\.1\.122:\d+)(\/api\/.*)?$/i,
  bearerPrefix: 'Bearer'
});

// Condição para localhost (desenvolvimento)
const localhostCondition = createInterceptorCondition<IncludeBearerTokenCondition>({
  urlPattern: /^(http:\/\/localhost:\d+)(\/api\/.*)?$/i,
  bearerPrefix: 'Bearer'
});

export const provideKeycloakAngular = () =>
  provideKeycloak({
    config: {
      url: 'http://192.168.1.122:9097',
      realm: 'raptor',
      clientId: 'angular-client'
    },
    initOptions: {
      onLoad: 'check-sso',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      // Não usar redirectUri global - deixar que cada guard decida
      enableLogging: true // Para debug
    },
    features: [
      withAutoRefreshToken({
        onInactivityTimeout: 'logout',
        sessionTimeout: 300000 // 5 minutos de inatividade
      })
    ],
    providers: [
      AutoRefreshTokenService,
      UserActivityService,
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useValue: [backendCondition, localhostCondition]
      }
    ]
  });