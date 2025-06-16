import { inject } from '@angular/core';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;
  
  // Se não está autenticado, será redirecionado automaticamente para login
  // devido ao onLoad: 'login-required' na configuração
  if (!authenticated) {
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
      const router = inject(Router);
      return router.parseUrl('/forbidden');
    }
  }

  return true;
};

export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);