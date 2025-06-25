// src/app/components/slots/dialogs/no-steam-dialog.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-no-steam-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">warning</mat-icon>
      Conta Steam Não Vinculada
    </h2>
    <mat-dialog-content>
      <p>Você precisa vincular sua conta Steam para acessar o sistema de slots.</p>
      <p>Clique em OK para ir até seu perfil e conectar sua conta Steam.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="goToProfile()">
        <mat-icon>person</mat-icon>
        Ir para Perfil
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 300px;
    }
    
    h2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    p {
      margin: 8px 0;
    }
  `]
})
export class NoSteamDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<NoSteamDialogComponent>);
  private readonly router = inject(Router);

  goToProfile(): void {
    this.dialogRef.close();
    this.router.navigate(['/profile']);
  }
}

