// src/environments/environment.ts
export const environment = {
  production: false,               // sempre FALSE no dev
  clarityProjectId: 'DEV-PLACEHOLDER',   // deixa vazio ou use um projeto separado
  keycloak: {
    url: 'https://keycloak.dev.meu-dominio.com',
    realm: 'meu-realm-dev',
    clientId: 'angular-app-dev',
  },
};
