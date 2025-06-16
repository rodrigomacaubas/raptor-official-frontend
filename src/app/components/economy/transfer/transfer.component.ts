import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="transfer-container">
      <h1>Transferir Moedas</h1>
      
      <mat-card class="transfer-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>send</mat-icon>
          <mat-card-title>Nova Transferência</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form class="transfer-form">
            <mat-form-field appearance="outline">
              <mat-label>Destinatário</mat-label>
              <input matInput placeholder="Nome do usuário" [(ngModel)]="recipient" name="recipient">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Moeda</mat-label>
              <mat-select [(ngModel)]="currencyType" name="currencyType">
                <mat-option value="np">NP</mat-option>
                <mat-option value="vidas">Vidas</mat-option>
                <mat-option value="dna">DNA</mat-option>
              </mat-select>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Quantidade</mat-label>
              <input matInput type="number" [(ngModel)]="amount" name="amount" min="1">
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Mensagem (opcional)</mat-label>
              <textarea matInput rows="3" [(ngModel)]="message" name="message"></textarea>
            </mat-form-field>
          </form>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="transfer()">
            <mat-icon>send</mat-icon>
            Transferir
          </button>
          <button mat-button (click)="cancel()">Cancelar</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .transfer-container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .transfer-card {
      margin-top: 24px;
    }
    
    .transfer-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `]
})
export class TransferComponent {
  recipient = '';
  currencyType = '';
  amount = 0;
  message = '';

  transfer() {
    console.log('Transfer:', { recipient: this.recipient, currencyType: this.currencyType, amount: this.amount, message: this.message });
  }

  cancel() {
    this.recipient = '';
    this.currencyType = '';
    this.amount = 0;
    this.message = '';
  }
}