import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="home-container">
      <h1>Bem-vindo ao Raptor Frontend</h1>
      <div class="cards-grid">
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
      h1 {
        margin-bottom: 16px;
        font-size: 28px; /* Example responsive font size for h1 */
      }
    }
  `]
})
export class HomeComponent {}