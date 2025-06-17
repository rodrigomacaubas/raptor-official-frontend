import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'transaction-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Detalhes da Transação</h2>
    <mat-dialog-content>
      <p><strong>ID:</strong> {{data.id}}</p>
      <p><strong>Tipo:</strong> {{data.type}}</p>
      <p><strong>Descrição:</strong> {{data.description}}</p>
      <p><strong>Valor:</strong> {{data.amount}}</p>
      <p><strong>Data:</strong> {{data.date | date:'full'}}</p>
      <p><strong>Status:</strong> {{data.status}}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        <mat-icon>close</mat-icon>
        Fechar
      </button>
    </mat-dialog-actions>
  `
})
export class TransactionDetailDialog {
  constructor(
    public dialogRef: MatDialogRef<TransactionDetailDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
