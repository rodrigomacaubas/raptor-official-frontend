// src/app/components/profile/profile-image-upload/profile-image-upload.component.ts
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ProfileImageService } from '../../../services/profile-image.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-image-upload',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
 template: `
    <div class="profile-image-container">
      <!-- Avatar/Imagem -->
      <div class="avatar-wrapper">
        <div class="avatar-image" 
             [class.has-image]="profileImageUrl"
             [style.background-image]="profileImageUrl ? 'url(' + profileImageUrl + ')' : null">
          <div *ngIf="!profileImageUrl" class="avatar-initials">
            {{ initials }}
          </div>
          <div *ngIf="uploading" class="upload-overlay">
            <mat-spinner diameter="40" color="accent"></mat-spinner>
          </div>
        </div>
        
        <!-- Botões de ação -->
        <div class="avatar-actions">
          <button mat-mini-fab 
                  color="primary" 
                  (click)="fileInput.click()"
                  [disabled]="uploading"
                  matTooltip="Alterar foto"
                  class="upload-button">
            <mat-icon>photo_camera</mat-icon>
          </button>
          
          <button mat-mini-fab 
                  *ngIf="profileImageUrl" 
                  color="warn" 
                  (click)="removeImage()"
                  [disabled]="uploading"
                  matTooltip="Remover foto"
                  class="delete-button">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      </div>
      
      <!-- Input de arquivo oculto -->
      <input type="file" 
             #fileInput 
             (change)="onFileSelected($event)"
             accept="image/jpeg,image/jpg,image/png,image/gif"
             style="display: none">
      
      <!-- Preview da nova imagem antes do upload -->
      <div *ngIf="previewUrl && !profileImageUrl" class="preview-section">
        <div class="preview-container">
          <img [src]="previewUrl" alt="Preview" class="preview-image">
          <div class="preview-actions">
            <button mat-raised-button color="primary" (click)="confirmUpload()" [disabled]="uploading">
              <mat-icon>check</mat-icon>
              Confirmar
            </button>
            <button mat-button (click)="cancelPreview()" [disabled]="uploading">
              <mat-icon>close</mat-icon>
              Cancelar
            </button>
          </div>
        </div>
      </div>
      
      <!-- Informações sobre o upload -->
      <div class="upload-info">
        <p class="info-text">
          <mat-icon>info</mat-icon>
          Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
        </p>
      </div>
    </div>
  `,
  styles: [`
    .profile-image-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 24px;
    }
    
    .avatar-wrapper {
      position: relative;
      width: 150px;
      height: 150px;
    }
    
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      border: 4px solid white;
    }
    
    .avatar-image.has-image {
      background: none;
    }
    
    .avatar-initials {
      font-size: 48px;
      font-weight: 500;
      color: white;
      text-transform: uppercase;
      user-select: none;
    }
    
    .upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .avatar-actions {
      position: absolute;
      bottom: 0;
      right: 0;
      display: flex;
      gap: 8px;
    }
    
    .upload-button,
    .delete-button {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transform: scale(0.9);
    }
    
    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      background: #f5f5f5;
    }
    
    .preview-image {
      width: 200px;
      height: 200px;
      object-fit: cover;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .preview-actions {
      display: flex;
      gap: 8px;
    }
    
    .upload-info {
      text-align: center;
      max-width: 300px;
    }
    
    .info-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    
    .info-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    @media (max-width: 600px) {
      .profile-image-container {
        padding: 16px;
      }
      
      .avatar-wrapper {
        width: 120px;
        height: 120px;
      }
      
      .avatar-initials {
        font-size: 36px;
      }
      
      .preview-image {
        width: 150px;
        height: 150px;
      }
      
      .upload-button,
      .delete-button {
        transform: scale(0.8);
      }
    }

      .preview-section {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 24px 0;
    }
    
    .preview-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      background: #f5f5f5;
    }

  `]
})
export class ProfileImageUploadComponent implements OnInit, OnDestroy {
  @Input() initials: string = '';
  @Input() currentImageUrl: string | null = null;
  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();

  private readonly profileImageService = inject(ProfileImageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  
  profileImageUrl: string | null = null;
  previewUrl: string | null = null;
  uploading = false;
  selectedFile: File | null = null;
  
  private subscriptions = new Subscription();

  ngOnInit(): void {
    // Define a imagem inicial
    this.profileImageUrl = this.currentImageUrl;
    
    // Inscreve-se nas mudanças da imagem
    this.subscriptions.add(
      this.profileImageService.profileImageUrl$.subscribe(url => {
        this.profileImageUrl = url;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    // Limpa preview URL se existir
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;

    // Processa e valida o arquivo
    const result = await this.profileImageService.processImageFile(file);
    
    if (!result.valid) {
      this.snackBar.open(result.errors.join(', '), 'Fechar', { 
        duration: 5000,
        panelClass: 'error-snackbar'
      });
      this.resetFileInput(input);
      return;
    }

    // Mostra o preview
    this.previewUrl = result.preview!;
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    this.resetFileInput(input);
  }

  confirmUpload(): void {
    if (!this.selectedFile) {
      return;
    }

    this.uploading = true;
    
    this.profileImageService.uploadProfileImage(this.selectedFile).subscribe({
      next: (response) => {
        this.snackBar.open('Foto de perfil atualizada com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: 'success-snackbar'
        });
        
        this.profileImageUrl = response.image_url;
        this.imageUploaded.emit(response.image_url);
        this.cancelPreview();
        this.uploading = false;
      },
      error: (error) => {
        console.error('Erro no upload:', error);
        
        let errorMessage = 'Erro ao fazer upload da imagem';
        if (error.type === 'VALIDATION_ERROR' && error.errors) {
          errorMessage = error.errors.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.snackBar.open(errorMessage, 'Fechar', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
        
        this.uploading = false;
      }
    });
  }

  removeImage(): void {
    if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
      this.uploading = true;
      
      this.profileImageService.deleteProfileImage().subscribe({
        next: () => {
          this.snackBar.open('Foto de perfil removida com sucesso!', 'Fechar', {
            duration: 3000,
            panelClass: 'success-snackbar'
          });
          
          this.profileImageUrl = null;
          this.imageRemoved.emit();
          this.uploading = false;
        },
        error: (error) => {
          console.error('Erro ao remover imagem:', error);
          
          this.snackBar.open('Erro ao remover foto de perfil', 'Fechar', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
          
          this.uploading = false;
        }
      });
    }
  }

  cancelPreview(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl = null;
    }
    this.selectedFile = null;
  }

  private resetFileInput(input: HTMLInputElement): void {
    input.value = '';
  }
}