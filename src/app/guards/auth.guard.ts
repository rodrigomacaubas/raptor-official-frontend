// src/app/guards/auth.guard.ts
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated } = authData;
  const keycloak = inject(Keycloak);
  const router = inject(Router);
  
  // Se não está autenticado, redireciona para login
  if (!authenticated) {
    // Salva a URL de destino para redirecionar após login
    const redirectUrl = state.url;
    await keycloak.login({
      redirectUri: window.location.origin + redirectUrl
    });
    return false;
  }

  // Se a rota tem um role específico definido, verifica se o usuário tem esse role
  const requiredRole = route.data['role'];
  if (requiredRole) {
    const { grantedRoles } = authData;
    const hasRequiredRole = (role: string): boolean => {
      // Verifica roles do realm
      if (grantedRoles.realmRoles.includes(role)) {
        return true;
      }
      // Verifica roles de recursos
      return Object.values(grantedRoles.resourceRoles).some((roles) => roles.includes(role));
    };

    if (!hasRequiredRole(requiredRole)) {
      return router.parseUrl('/forbidden');
    }
  }

  return true;
};

export const AuthGuard = createAuthGuard<CanActivateFn>(isAccessAllowed);