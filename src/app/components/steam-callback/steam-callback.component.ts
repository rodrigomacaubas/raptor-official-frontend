// src/app/components/steam-callback/
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { SteamService } from '../../services/steam.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-steam-callback',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="callback-container">
      <mat-card class="callback-card">
        <mat-card-content>
          <div class="loading-content">
            <mat-spinner diameter="40"></mat-spinner>
            <h2>Processando autenticação Steam...</h2>
            <p>Por favor, aguarde enquanto verificamos suas credenciais.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .callback-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #f5f5f5;
    }
    
    .callback-card {
      max-width: 400px;
      text-align: center;
    }
    
    .loading-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
    }
    
    h2 {
      margin: 0;
      color: #333;
    }
    
    p {
      margin: 0;
      color: #666;
    }
  `]
})
export class SteamCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly steamService = inject(SteamService);
  private readonly snackBar = inject(MatSnackBar);

  async ngOnInit() {
    try {
      // Processa o callback da Steam
      const result = await lastValueFrom(this.steamService.processSteamCallback());
      
      let message = 'Conta Steam conectada com sucesso!';
      if (result.status === 'existing') {
        message = 'Esta conta Steam já estava vinculada';
      } else if (result.status === 'conflict') {
        message = 'Esta conta Steam já está vinculada a outro usuário';
      }
      
      this.snackBar.open(message, 'Fechar', { duration: 5000 });
      
      // Redireciona para o perfil após sucesso
      this.router.navigate(['/profile']);
    } catch (error) {
      console.error('Erro ao processar callback Steam:', error);
      this.snackBar.open('Falha ao conectar conta Steam', 'Fechar', { duration: 3000 });
      
      // Em caso de erro, redireciona para o perfil
      this.router.navigate(['/profile']);
    }
  }
}