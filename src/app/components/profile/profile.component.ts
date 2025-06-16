// src/app/components/profile/profile.component.ts
import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import Keycloak, { KeycloakProfile } from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';
import { SteamService } from '../../services/steam.service';
import { SteamId } from '../../services/api.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface UserAddress {
  id?: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country?: string;
  is_active: boolean;
}

interface UserPhone {
  id?: string;
  phone_number: string;
  phone_type?: string;
  is_active: boolean;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatIconModule, 
    MatButtonModule, MatListModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatDialogModule, MatSnackBarModule,
    MatTableModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly steamService = inject(SteamService);
  private readonly router = inject(Router);

  // User data
  userProfile: KeycloakProfile = {};
  authenticated = false;
  
  // Steam integration
  steamIds: SteamId[] = [];
  steamLoading = false;
  private subscriptions = new Subscription();
  
  // Address book
  addresses: UserAddress[] = [];
  addressForm: FormGroup;
  showAddressForm = false;
  editingAddress: UserAddress | null = null;
  
  // Phone book
  phones: UserPhone[] = [];
  phoneForm: FormGroup;
  showPhoneForm = false;
  editingPhone: UserPhone | null = null;

  constructor() {
    this.addressForm = this.fb.group({
      address_line1: ['', Validators.required],
      address_line2: [''],
      city: ['', Validators.required],
      state: [''],
      postal_code: [''],
      country: ['']
    });

    this.phoneForm = this.fb.group({
      phone_number: ['', Validators.required],
      phone_type: ['mobile']
    });

    // Monitor Keycloak events
    effect(() => {
      const keycloakEvent = this.keycloakSignal();
      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.handleLogout();
      }
    });
  }

async ngOnInit() {
  // Verifica se há parâmetros de retorno do Steam na URL
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.has('steam_success')) {
    const status = urlParams.get('status');
    let message = 'Conta Steam conectada com sucesso!';
    if (status === 'existing') {
      message = 'Esta conta Steam já estava vinculada';
    } else if (status === 'conflict') {
      message = 'Esta conta Steam já está vinculada a outro usuário';
    }
    this.snackBar.open(message, 'Fechar', { duration: 5000 });
    
    // Limpa os parâmetros da URL
    this.router.navigate([], { replaceUrl: true });
  } else if (urlParams.has('steam_error')) {
    const error = urlParams.get('steam_error');
    const errorMessages: { [key: string]: string } = {
      'missing_params': 'Parâmetros de autenticação não encontrados',
      'network_error': 'Erro de conexão com o servidor',
      'default': 'Falha ao conectar conta Steam'
    };
    const message = errorMessages[error || ''] 
      || decodeURIComponent(error || errorMessages['default']);
    this.snackBar.open(message, 'Fechar', { duration: 5000 });
    
    // Limpa os parâmetros da URL
    this.router.navigate([], { replaceUrl: true });
  }
  
  await this.initializeComponent();
}


  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private async initializeComponent(): Promise<void> {
    try {
      await this.loadUserData();
      this.initializeSteamSubscriptions();
    } catch (error) {
      console.error('Initialization error:', error);
      this.snackBar.open('Erro ao inicializar perfil', 'Fechar', { duration: 3000 });
    }
  }

  private async loadUserData(): Promise<void> {
    this.authenticated = this.keycloak.authenticated ?? false;
    
    if (this.authenticated) {
      try {
        this.userProfile = await this.keycloak.loadUserProfile();
        this.loadSteamIds();
      } catch (error) {
        console.error('Failed to load user profile:', error);
        throw error;
      }
    }
  }

  private initializeSteamSubscriptions(): void {
    this.subscriptions.add(
      this.steamService.steamIds$.subscribe({
        next: (steamIds) => this.steamIds = steamIds,
        error: (error) => console.error('Steam IDs subscription error:', error)
      })
    );

    this.subscriptions.add(
      this.steamService.loading$.subscribe({
        next: (loading) => this.steamLoading = loading,
        error: (error) => console.error('Loading subscription error:', error)
      })
    );
  }

  private loadSteamIds(): void {
    this.steamService.loadUserSteamIds().subscribe({
      error: (error) => {
        console.error('Failed to load Steam IDs:', error);
        this.snackBar.open('Erro ao carregar contas Steam', 'Fechar', { duration: 3000 });
      }
    });
  }

  // Steam connection methods
  connectSteam(): void {
    this.steamService.getSteamLoginUrl().subscribe({
      next: (url) => window.location.href = url,
      error: (error) => {
        console.error('Failed to get Steam URL:', error);
        this.snackBar.open('Erro ao conectar com Steam', 'Fechar', { duration: 3000 });
      }
    });
  }

  setDefaultSteam(steamId: string): void {
    if (confirm('Definir esta conta como padrão?')) {
      this.steamService.setDefaultSteamId(steamId).subscribe({
        error: (error) => {
          console.error('Failed to set default Steam ID:', error);
          this.snackBar.open('Erro ao definir conta padrão', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  removeSteam(steamId: string): void {
    if (confirm('Tem certeza que deseja remover esta conta Steam?')) {
      this.steamService.deleteSteamId(steamId).subscribe({
        error: (error) => {
          console.error('Failed to remove Steam ID:', error);
          this.snackBar.open('Erro ao remover conta Steam', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  // Address book methods
  addAddress(): void {
    this.editingAddress = null;
    this.addressForm.reset();
    this.showAddressForm = true;
  }

  editAddress(address: UserAddress): void {
    this.editingAddress = address;
    this.addressForm.patchValue(address);
    this.showAddressForm = true;
  }

  saveAddress(): void {
    if (this.addressForm.invalid) return;

    const addressData = { ...this.addressForm.value, is_active: true };
    
    if (this.editingAddress) {
      const index = this.addresses.findIndex(a => a.id === this.editingAddress!.id);
      this.addresses[index] = { ...this.editingAddress, ...addressData };
      this.showSnackbar('Endereço atualizado com sucesso!');
    } else {
      this.addresses.push({ ...addressData, id: Date.now().toString() });
      this.showSnackbar('Endereço adicionado com sucesso!');
    }
    
    this.cancelAddressForm();
  }

  deleteAddress(id: string): void {
    if (confirm('Tem certeza que deseja excluir este endereço?')) {
      this.addresses = this.addresses.filter(a => a.id !== id);
      this.showSnackbar('Endereço excluído com sucesso!');
    }
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  // Phone book methods
  addPhone(): void {
    this.editingPhone = null;
    this.phoneForm.reset({ phone_type: 'mobile' });
    this.showPhoneForm = true;
  }

  editPhone(phone: UserPhone): void {
    this.editingPhone = phone;
    this.phoneForm.patchValue(phone);
    this.showPhoneForm = true;
  }

  savePhone(): void {
    if (this.phoneForm.invalid) return;

    const phoneData = { ...this.phoneForm.value, is_active: true };
    
    if (this.editingPhone) {
      const index = this.phones.findIndex(p => p.id === this.editingPhone!.id);
      this.phones[index] = { ...this.editingPhone, ...phoneData };
      this.showSnackbar('Telefone atualizado com sucesso!');
    } else {
      this.phones.push({ ...phoneData, id: Date.now().toString() });
      this.showSnackbar('Telefone adicionado com sucesso!');
    }
    
    this.cancelPhoneForm();
  }

  deletePhone(id: string): void {
    if (confirm('Tem certeza que deseja excluir este telefone?')) {
      this.phones = this.phones.filter(p => p.id !== id);
      this.showSnackbar('Telefone excluído com sucesso!');
    }
  }

  cancelPhoneForm(): void {
    this.showPhoneForm = false;
    this.editingPhone = null;
    this.phoneForm.reset({ phone_type: 'mobile' });
  }

  // Utility methods
  private handleLogout(): void {
    this.authenticated = false;
    this.userProfile = {};
    this.steamIds = [];
  }

  private showSnackbar(message: string): void {
    this.snackBar.open(message, 'Fechar', { duration: 3000 });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getInitials(): string {
    const firstName = this.userProfile.firstName || '';
    const lastName = this.userProfile.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getPhoneIcon(type?: string): string {
    switch (type) {
      case 'mobile': return 'smartphone';
      case 'home': return 'home';
      case 'work': return 'business';
      default: return 'phone';
    }
  }

  getPhoneTypeLabel(type?: string): string {
    switch (type) {
      case 'mobile': return 'Celular';
      case 'home': return 'Residencial';
      case 'work': return 'Comercial';
      default: return 'Telefone';
    }
  }

  // TrackBy functions
  trackBySteamId(index: number, steamId: SteamId): string {
    return steamId.steamid64;
  }

  trackByAddressId(index: number, address: UserAddress): string {
    return address.id || index.toString();
  }

  trackByPhoneId(index: number, phone: UserPhone): string {
    return phone.id || index.toString();
  }
}