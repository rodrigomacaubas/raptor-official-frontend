// src/app/services/profile-image.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { GlobalConstants } from '../common/global-constants';

export interface ProfileImageResponse {
  message: string;
  image_url: string;
}

export interface ProfileImageError {
  error?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfileImageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';
  
  // Estado da imagem do perfil
  private profileImageUrlSubject = new BehaviorSubject<string | null>(null);
  public profileImageUrl$ = this.profileImageUrlSubject.asObservable();
  
  // Configurações de upload
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  private readonly ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif'];

  /**
   * Valida o arquivo antes do upload
   */
  validateFile(file: File): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validação de tamanho
    if (file.size > this.MAX_FILE_SIZE) {
      errors.push(`O arquivo deve ter no máximo ${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Validação de tipo MIME
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      errors.push('Formato de arquivo não permitido. Use JPG, PNG ou GIF');
    }

    // Validação de extensão
    const fileName = file.name.toLowerCase();
    const hasValidExtension = this.ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      errors.push('Extensão de arquivo inválida');
    }

    // Validação de nome do arquivo (prevenção contra path traversal)
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      errors.push('Nome de arquivo inválido');
    }

    // Validação adicional do conteúdo (verifica magic numbers)
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Verifica os magic numbers do arquivo para garantir que é uma imagem real
   */
  async verifyImageContent(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onloadend = (e) => {
        if (!e.target?.result) {
          resolve(false);
          return;
        }

        const arr = new Uint8Array(e.target.result as ArrayBuffer).subarray(0, 4);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += arr[i].toString(16);
        }

        // Verifica magic numbers conhecidos
        const validHeaders = [
          '89504e47', // PNG
          'ffd8ffe0', // JPEG
          'ffd8ffe1', // JPEG
          'ffd8ffe2', // JPEG
          'ffd8ffe3', // JPEG
          'ffd8ffe8', // JPEG
          '47494638'  // GIF
        ];

        resolve(validHeaders.some(validHeader => header.startsWith(validHeader)));
      };

      reader.onerror = () => resolve(false);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  /**
   icia uma imagem no local (para preview) e valida
   */
  async processImageFile(file: File): Promise<{ valid: boolean; errors: string[]; preview?: string }> {
    // Validação inicial
    const validation = this.validateFile(file);
    if (!validation.valid) {
      return validation;
    }

    // Verifica o conteúdo real do arquivo
    const isValidImage = await this.verifyImageContent(file);
    if (!isValidImage) {
      return {
        valid: false,
        errors: ['O arquivo não é uma imagem válida']
      };
    }

    // Cria preview
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onloadend = (e) => {
        resolve({
          valid: true,
          errors: [],
          preview: e.target?.result as string
        });
      };

      reader.onerror = () => {
        resolve({
          valid: false,
          errors: ['Erro ao processar a imagem']
        });
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Faz upload da foto de perfil
   */
  uploadProfileImage(file: File): Observable<ProfileImageResponse> {
    const formData = new FormData();
    formData.append('profile_image', file);

    return this.http.post<ProfileImageResponse>(
      `${this.baseUrl}/upload/user-profile`,
      formData
    ).pipe(
      tap(response => {
        // Atualiza a URL da imagem no estado
        this.profileImageUrlSubject.next(response.image_url);
      }),
      catchError(error => {
        console.error('Erro no upload:', error);
        
        // Trata erros específicos do backend
        if (error.error?.errors) {
          return throwError(() => ({
            type: 'VALIDATION_ERROR',
            errors: error.error.errors
          }));
        }
        
        return throwError(() => ({
          type: 'GENERAL_ERROR',
          message: error.error?.error || 'Erro ao fazer upload da imagem'
        }));
      })
    );
  }

  /**
   * Remove a foto de perfil
   */
  deleteProfileImage(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/images/user-profile/delete`).pipe(
      tap(() => {
        // Remove a URL da imagem do estado
        this.profileImageUrlSubject.next(null);
      }),
      catchError(error => {
        console.error('Erro ao remover imagem:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Define a URL da imagem de perfil (usado quando carrega do servidor)
   */
  setProfileImageUrl(url: string | null): void {
    this.profileImageUrlSubject.next(url);
  }

  /**
   * Obtém a URL atual da imagem de perfil
   */
  getCurrentImageUrl(): string | null {
    return this.profileImageUrlSubject.value;
  }

  /**
   * Limpa o estado do serviço
   */
  clearState(): void {
    this.profileImageUrlSubject.next(null);
  }
}