import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-store-legacy',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatGridListModule],
  template: `
    <div class="store-container">
      <h1>Loja Legacy</h1>
      
      <mat-grid-list cols="3" rowHeight="300px" gutterSize="16px">
        <mat-grid-tile *ngFor="let item of storeItems">
          <mat-card class="store-item">
            <mat-card-header>
              <mat-icon mat-card-avatar>{{ item.icon }}</mat-icon>
              <mat-card-title>{{ item.name }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>{{ item.description }}</p>
              <div class="price">
                <mat-icon class="currency-icon">{{ item.currency.icon }}</mat-icon>
                {{ item.price }}
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-raised-button color="primary">
                <mat-icon>shopping_cart</mat-icon>
                Comprar
              </button>
            </mat-card-actions>
          </mat-card>
        </mat-grid-tile>
      </mat-grid-list>
    </div>
  `,
  styles: [`
    .store-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .store-item {
      width: 100%;
      height: 280px;
      display: flex;
      flex-direction: column;
    }
    
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 24px;
    }
    
    .price {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 500;
      color: #ff6600;
      margin-top: 8px;
    }
    
    .currency-icon {
      color: #ffd700;
    }
    
    mat-card-content {
      flex: 1;
    }
  `]
})
export class StoreLegacyComponent {
  storeItems = [
    {
      name: 'Skin Especial',
      description: 'Uma skin exclusiva para seu dinossauro.',
      price: 500,
      currency: { icon: 'toll', name: 'NP' },
      icon: 'palette'
    },
    {
      name: 'Vida Extra',
      description: 'Adiciona uma vida extra ao seu personagem.',
      price: 100,
      currency: { icon: 'toll', name: 'NP' },
      icon: 'favorite'
    },
    {
      name: 'DNA Boost',
      description: 'Acelera o ganho de DNA por 24 horas.',
      price: 250,
      currency: { icon: 'toll', name: 'NP' },
      icon: 'science'
    }
  ];
}