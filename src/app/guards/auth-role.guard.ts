// src/app/guards/auth-role.guard.ts
import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import Keycloak from 'keycloak-js';

const isAccessAllowedOptional = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  const router = inject(Router);
  
  // MUDANÇA: Se não autenticado, redireciona para login em vez de bloquear
  if (!authenticated) {
    const keycloak = inject(Keycloak);
    await keycloak.login({
      redirectUri: window.location.origin + state.url
    });
    return false;
  }

  // Se a rota tem um role específico definido, verifica se o usuário tem esse role
  const requiredRole = route.data['role'];
  if (requiredRole) {
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

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowedOptional);