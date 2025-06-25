// src/app/components/server-selector/server-selector.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ServerService } from '../../services/server.service';
import { Subscription } from 'rxjs';

interface Server {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

@Component({
  selector: 'app-server-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <button mat-button [matMenuTriggerFor]="serverMenu" class="server-selector-button">
      <mat-icon>dns</mat-icon>
      <span class="server-name">{{ currentServerName }}</span>
      <mat-icon class="dropdown-icon">arrow_drop_down</mat-icon>
    </button>
    
    <mat-menu #serverMenu="matMenu">
      <div class="server-menu-header">
        <span>Servidores Disponíveis</span>
      </div>
      <mat-divider></mat-divider>
      
      <button mat-menu-item 
              *ngFor="let server of availableServers" 
              (click)="selectServer(server)"
              [disabled]="!server.isActive || server.id === currentServerId"
              class="server-menu-item">
        <mat-icon>{{ server.id === currentServerId ? 'check_circle' : 'circle' }}</mat-icon>
        <span>{{ server.name }}</span>
        <span class="server-status" *ngIf="!server.isActive">(Indisponível)</span>
      </button>
      
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="20"></mat-spinner>
        <span>Carregando...</span>
      </div>
      
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="refreshServers()">
        <mat-icon>refresh</mat-icon>
        <span>Atualizar Lista</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .server-selector-button {
      display: flex;
      align-items: center;
      gap: 8px;
      color: white;
      font-weight: 500;
      padding: 4px 12px;
      border-radius: 4px;
      transition: background 0.3s ease;
    }
    
    .server-selector-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .server-name {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .dropdown-icon {
      margin-left: 4px;
    }
    
    .server-menu-header {
      padding: 12px 16px;
      font-weight: 500;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .server-menu-item {
      min-width: 250px;
    }
    
    .server-menu-item mat-icon {
      margin-right: 12px;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .server-menu-item mat-icon[ng-reflect-text="check_circle"] {
      color: #4caf50;
    }
    
    .server-status {
      margin-left: auto;
      font-size: 12px;
      color: #999;
    }
    
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 16px;
      color: #666;
    }
    
    .loading-container span {
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .server-selector-button {
        padding: 4px 8px;
      }
      
      .server-name {
        max-width: 120px;
        font-size: 14px;
      }
      
      .server-selector-button mat-icon {
        font-size: 20px;
      }
    }
  `]
})
export class ServerSelectorComponent implements OnInit, OnDestroy {
  private readonly serverService = inject(ServerService);
  private subscriptions = new Subscription();
  
  currentServerName = 'Painel Raptor Cloud';
  currentServerId = '';
  loading = false;
  
  // Lista de servidores disponíveis (pode vir de uma API no futuro)
  availableServers: Server[] = [
    {
      id: 'fd46f7d5-89fa-4dd0-9bf4-d9e023e241ce',
      name: 'NextLevel',
      description: 'Servidor principal NextLevel',
      isActive: true
    },
    {
      id: 'other-server-id',
      name: 'Servidor Secundário',
      description: 'Servidor de teste',
      isActive: false
    }
  ];
  
  ngOnInit() {
    // Se inscreve para mudanças no nome do servidor
    this.subscriptions.add(
      this.serverService.serverName$.subscribe(name => {
        this.currentServerName = name;
      })
    );
    
    // Se inscreve no estado de loading
    this.subscriptions.add(
      this.serverService.loading$.subscribe(loading => {
        this.loading = loading;
      })
    );
    
    // Obtém o ID do servidor atual
    this.currentServerId = this.serverService.getCurrentServerId();
  }
  
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
  
  selectServer(server: Server) {
    if (server.id !== this.currentServerId && server.isActive) {
      this.currentServerId = server.id;
      this.serverService.setCurrentServer(server.id);
    }
  }
  
  refreshServers() {
    // No futuro, isso pode buscar a lista de servidores de uma API
    this.serverService.refreshServerData().subscribe();
  }
}