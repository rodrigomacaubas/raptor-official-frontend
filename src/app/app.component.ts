// src/app/app.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit, signal, inject, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, typeEventArgs, ReadyArgs, HasRolesDirective } from 'keycloak-angular';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  children?: MenuItem[];
  disabled?: boolean;
}

interface Currency {
  label: string;
  icon: string;
  value: number;
  class: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  title = 'raptorfrontend';
  isMinimized = signal(false);
  isMobile = signal(false);
  isDesktop = signal(true);
  isDrawerOpen = signal(false);
  userProfile: KeycloakProfile = {};
  authenticated = false;
  
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly router = inject(Router);
  private readonly resizeListener: () => void;
  
  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'home',
      children: [
        { label: 'Perfil', icon: 'person', route: '/profile' }
      ]
    },
    {
      label: 'Sistema de Slots',
      icon: 'casino',
      children: [
        { label: 'Slots Legacy', icon: 'gamepad', route: '/slotslegacy' },
        { label: 'Slots Evrima', icon: 'games', route: '/slotsevrima', disabled: true }
      ]
    },
    {
      label: 'Economia',
      icon: 'attach_money',
      children: [
        { label: 'Transferir', icon: 'send', route: '/transfer' },
        { label: 'Loja Legacy', icon: 'store', route: '/storelegacy' },
        { label: 'Loja Evrima', icon: 'storefront', route: '/storeevrima', disabled: true },
        { label: 'Extrato da Conta', icon: 'receipt', route: '/transactionhistory' }
      ]
    }
  ];

  currencies: Currency[] = [
    { label: 'NP', icon: 'toll', value: 1234, class: 'np' },
    { label: 'Vidas', icon: 'favorite', value: 5, class: 'vidas' },
    { label: 'DNA', icon: 'science', value: 89, class: 'dna' }
  ];

  constructor() {
    // Verifica o tamanho da tela
    this.checkScreenSize();
    this.resizeListener = () => this.checkScreenSize();
    window.addEventListener('resize', this.resizeListener);

    // Monitora eventos do Keycloak
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
        this.userProfile = {};
      }
    });
  }

  async ngOnInit() {
    // Verifica se estamos em uma rota especial (steam-callback)
    const currentUrl = this.router.url;
    const isSpecialRoute = currentUrl.includes('steam-callback');
    
    // Se for uma rota especial, não faz nada
    if (isSpecialRoute) {
      console.log('Rota especial detectada, pulando inicialização padrão');
      return;
    }

    if (this.keycloak.authenticated) {
      this.authenticated = true;
      try {
        this.userProfile = await this.keycloak.loadUserProfile();
        
        // Só redireciona se não estiver autenticado e estiver na raiz
        if (!this.authenticated && (this.router.url === '/' || this.router.url === '')) {
          this.router.navigate(['/home']);
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
      }
    }
  }

  toggleSidebar() {
    if (this.isMobile()) {
      this.isDrawerOpen.update(value => !value);
      if (this.drawer) {
        this.drawer.toggle();
      }
    } else {
      this.isMinimized.update(value => !value);
    }
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  getInitials(): string {
    const firstName = this.userProfile.firstName || '';
    const lastName = this.userProfile.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  logout() {
    this.keycloak.logout();
  }

  checkScreenSize() {
    const width = window.innerWidth;
    this.isMobile.set(width < 768);
    this.isDesktop.set(width >= 768);
  }

  closeMobileDrawer() {
    if (this.isMobile()) {
      this.isDrawerOpen.set(false);
      if (this.drawer && this.drawer.opened) {
        this.drawer.close();
      }
    }
  }

  shouldShowCurrenciesInSidebar(): boolean {
    return this.isMobile();
  }

  shouldShowCurrenciesInToolbar(): boolean {
    return !this.isMobile();
  }

  ngAfterViewInit() {
    // Garante que o drawer esteja fechado no mobile inicialmente
    if (this.isMobile() && this.drawer) {
      this.drawer.close();
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  }
}