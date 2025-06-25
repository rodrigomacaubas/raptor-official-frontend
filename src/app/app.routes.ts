// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { canActivateAuthRole } from './guards/auth-role.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'steam-callback',
    loadComponent: () => import('./components/steam-callback/steam-callback.component').then(m => m.SteamCallbackComponent),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'slotslegacy',
    loadComponent: () => import('./components/slots/slots-legacy/slots-legacy.component').then(m => m.SlotsLegacyComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'slotsevrima',
    loadComponent: () => import('./components/slots/slots-evrima/slots-evrima.component').then(m => m.SlotsEvrimaComponent),
    canActivate: [canActivateAuthRole],
    data: { role: 'view-slots-evrima' }
  },
  {
    path: 'transfer',
    loadComponent: () => import('./components/economy/transfer/transfer.component').then(m => m.TransferComponent),
    canActivate: [canActivateAuthRole],
    data: { role: 'manage-economy' }
  },
  {
    path: 'storelegacy',
    loadComponent: () => import('./components/economy/store-legacy/store-legacy.component').then(m => m.StoreLegacyComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'storeevrima',
    loadComponent: () => import('./components/economy/store-evrima/store-evrima.component').then(m => m.StoreEvrimaComponent),
    canActivate: [canActivateAuthRole],
    data: { role: 'view-store' }
  },
  {
    path: 'transactionhistory',
    loadComponent: () => import('./components/economy/transaction-history/transaction-history.component').then(m => m.TransactionHistoryComponent),
    canActivate: [canActivateAuthRole],
    data: { role: 'view-transactions' }
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./components/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./components/notfound/notfound.component').then(m => m.NotfoundComponent)
  }

];