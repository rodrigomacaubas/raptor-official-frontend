import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="forbidden-container">
      <mat-card class="forbidden-card">
        <mat-card-header>
          <mat-icon mat-card-avatar color="warn">block</mat-icon>
          <mat-card-title>Acesso Negado</mat-card-title>
          <mat-card-subtitle>403 - Forbidden</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <p>Você não tem permissão para acessar esta página.</p>
          <p>Entre em contato com o administrador se você acredita que deveria ter acesso.</p>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" routerLink="/home">
            <mat-icon>home</mat-icon>
            Voltar ao Início
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .forbidden-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 24px;
    }
    
    .forbidden-card {
      max-width: 500px;
      text-align: center;
    }
    
    mat-card-header {
      justify-content: center;
      margin-bottom: 24px;
    }
    
    mat-icon[mat-card-avatar] {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    
    mat-card-content p {
      margin: 16px 0;
      color: #666;
    }
  `]
})
export class ForbiddenComponent {}