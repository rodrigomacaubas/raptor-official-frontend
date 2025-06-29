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
import { ServerService } from './services/server.service';
import { ServerSelectorComponent } from './components/server-selector/server-selector.component';
import { ProfileImageService } from './services/profile-image.service';
import { ApiService } from './services/api.service';
import { Subscription } from 'rxjs';


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
    RouterModule,
    ServerSelectorComponent
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
  profileImageUrl: string | null = null;
  
  // Nome do servidor
  serverName = 'Painel Raptor Cloud';
  
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly router = inject(Router);
  private readonly serverService = inject(ServerService);
  private readonly profileImageService = inject(ProfileImageService);
  private readonly apiService = inject(ApiService);
  private readonly resizeListener: () => void;
  private subscriptions = new Subscription();
  
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

  currencies: Currency[] = [];

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
        
        // Se autenticado, carrega os dados do servidor
        if (this.authenticated) {
          this.loadServerData();
          this.loadUserProfileImage();
        }
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
        this.userProfile = {};
        this.currencies = [];
        this.serverName = 'Painel Raptor Cloud';
        this.profileImageUrl = null;
        this.profileImageService.clearState();
      }
    });
    
    // Se inscreve nas mudanças do servidor
    this.subscriptions.add(
      this.serverService.serverName$.subscribe(name => {
        this.serverName = name;
      })
    );
    
    // Se inscreve nas mudanças das moedas
    this.subscriptions.add(
      this.serverService.currencies$.subscribe(currencies => {
        this.currencies = currencies as any[];
      })
    );
    
    // Se inscreve nas mudanças da imagem de perfil
    this.subscriptions.add(
      this.profileImageService.profileImageUrl$.subscribe(url => {
        this.profileImageUrl = url;
      })
    );
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
        
        // Carrega os dados do servidor após autenticação
        this.loadServerData();
        this.loadUserProfileImage();
        console.log(this.loadUserProfileImage)
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
    this.subscriptions.unsubscribe();
  }
  
  private loadServerData(): void {
    this.serverService.loadServerBalance().subscribe({
      next: (response) => {
        console.log('Dados do servidor carregados:', response);
      },
      error: (error) => {
        console.error('Erro ao carregar dados do servidor:', error);
      }
    });
  }
  
  private loadUserProfileImage(): void {
    this.apiService.getUserProfile().subscribe({
      next: (profile) => {
        console.log('Perfil carregado:', profile); // Debug
        
        if (profile.has_image && profile.profile_image_url) {
          this.profileImageUrl = profile.profile_image_url;
          this.profileImageService.setProfileImageUrl(profile.profile_image_url);
        } else {
          this.profileImageUrl = null;
          this.profileImageService.setProfileImageUrl(null);
        }
      },
      error: (error) => {
        console.error('Erro ao carregar imagem do perfil:', error);
      }
    });
  }

}