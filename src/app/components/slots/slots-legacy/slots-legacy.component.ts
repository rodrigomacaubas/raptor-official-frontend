import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-slots-legacy',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="slots-container">
      <h1>Slots Legacy</h1>
      <mat-card class="slots-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>casino</mat-icon>
          <mat-card-title>Sistema de Slots Legacy</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Sistema de slots da versão Legacy do jogo.</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="primary">
            <mat-icon>play_arrow</mat-icon>
            Jogar
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
    
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class SlotsLegacyComponent {}