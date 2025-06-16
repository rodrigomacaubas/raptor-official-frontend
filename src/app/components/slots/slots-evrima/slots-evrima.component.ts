import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-slots-evrima',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="slots-container">
      <h1>Slots Evrima</h1>
      <mat-card class="slots-card disabled">
        <mat-card-header>
          <mat-icon mat-card-avatar>games</mat-icon>
          <mat-card-title>Sistema de Slots Evrima</mat-card-title>
          <mat-card-subtitle>Em desenvolvimento</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Sistema de slots da versão Evrima do jogo. Disponível em breve.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button disabled>
            <mat-icon>lock</mat-icon>
            Em breve
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .slots-container {
      max-width: 800px;
      margin: 0 auto;
    }
    
    .slots-card {
      margin-top: 24px;
    }
    
    .slots-card.disabled {
      opacity: 0.6;
    }
    
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class SlotsEvrimaComponent {}