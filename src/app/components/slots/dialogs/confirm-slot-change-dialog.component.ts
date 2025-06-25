// src/app/components/slots/dialogs/confirm-slot-change-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmSlotChangeData {
  fromSlot: string;
  toSlot: string;
  cooldownMinutes?: number;
}

@Component({
  selector: 'app-confirm-slot-change-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>swap_horiz</mat-icon>
      Confirmar Troca de Slot
    </h2>
    <mat-dialog-content>
      <p><strong>Atenção!</strong> Você está prestes a trocar do <strong>{{ data.fromSlot }}</strong> para o <strong>{{ data.toSlot }}</strong>.</p>
      
      <div class="warning-box">
        <mat-icon color="warn">warning</mat-icon>
        <div>
          <p>Certifique-se de que você está <strong>deslogado do servidor</strong> antes de continuar.</p>
          <p *ngIf="data.cooldownMinutes">Após a troca, você precisará aguardar <strong>{{ data.cooldownMinutes }} minutos</strong> antes de poder trocar novamente.</p>
        </div>
      </div>
      
      <p class="confirmation-text">Você está deslogado do servidor e deseja continuar com a troca?</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">
        <mat-icon>close</mat-icon>
        Cancelar
      </button>
      <button mat-raised-button color="primary" (click)="confirm()">
        <mat-icon>check</mat-icon>
        Sim, Trocar Slot
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .warning-box {
      display: flex;
      gap: 12px;
      background: #fff3e0;
      border: 1px solid #ffb74d;
      border-radius: 4px;
      padding: 16px;
      margin: 16px 0;
    }
    
    .warning-box mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }
    
    .warning-box p {
      margin: 4px 0;
      color: #e65100;
    }
    
    .confirmation-text {
      margin-top: 16px;
      font-weight: 500;
    }
    
    @media (max-width: 600px) {
      mat-dialog-content {
        min-width: auto;
      }
    }
  `]
})
export class ConfirmSlotChangeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmSlotChangeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmSlotChangeData
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}

