// src/app/components/home/home.component.ts
import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, typeEventArgs, ReadyArgs } from 'keycloak-angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="home-container">
      <h1>Bem-vindo ao Raptor Frontend</h1>
      
      <!-- Conteúdo para usuários não autenticados -->
      <div *ngIf="!authenticated" class="guest-content">
        <mat-card class="welcome-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>info</mat-icon>
            <mat-card-title>Acesso Limitado</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Você está visualizando o sistema como visitante.</p>
            <p>Para acessar todas as funcionalidades, faça login em sua conta.</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="login()">
              <mat-icon>login</mat-icon>
              Fazer Login
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
      
      <!-- Conteúdo para usuários autenticados -->
      <div *ngIf="authenticated" class="cards-grid">
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>dashboard</mat-icon>
            <mat-card-title>Dashboard</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Visão geral das suas atividades no sistema.</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>casino</mat-icon>
            <mat-card-title>Slots</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Acesse os sistemas de slots disponíveis.</p>
          </mat-card-content>
        </mat-card>
        
        <mat-card class="info-card">
          <mat-card-header>
            <mat-icon mat-card-avatar>attach_money</mat-icon>
            <mat-card-title>Economia</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Gerencie suas moedas e transações.</p>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .guest-content {
      display: flex;
      justify-content: center;
      margin-top: 40px;
    }
    
    .welcome-card {
      max-width: 500px;
      text-align: center;
    }
    
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
      margin-top: 24px;
    }
    
    .info-card {
      /* height: 200px; Removed fixed height to allow content-based sizing */
    }
    
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 24px;
    }

    @media (max-width: 600px) {
      .cards-grid {
        gap: 16px;
        margin-top: 16px;
      }
      
      .welcome-card {
        margin: 0 16px;
      }
      
      h1 {
        margin-bottom: 16px;
        font-size: 28px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private readonly keycloak = inject(Keycloak);
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  authenticated = false;

  constructor() {
    // Monitora eventos do Keycloak usando signals
    effect(() => {
      const keycloakEvent = this.keycloakSignal();

      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);
      }

      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated = false;
      }
    });
  }

  ngOnInit() {
    // Verifica o estado inicial
    this.authenticated = this.keycloak.authenticated ?? false;
  }

  login() {
    this.keycloak.login();
  }
}