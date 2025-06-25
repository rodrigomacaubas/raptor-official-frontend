import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SlotsService, Slot } from '../../../services/slots.service';
import { NoSteamDialogComponent } from '../dialogs/no-steam-dialog.component';
import { ConfirmSlotChangeDialogComponent } from '../dialogs/confirm-slot-change-dialog.component';
import { CooldownDialogComponent } from '../dialogs/cooldown-dialog.component';
import { GlobalConstants } from '../../../common/global-constants';

@Component({
  selector: 'app-slots-legacy',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatListModule,
    MatDividerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="slots-container">
      <h1>Slots Legacy</h1>
      
      <!-- Loading State -->
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="40"></mat-spinner>
        <p>Carregando seus slots...</p>
      </div>

      <!-- Slots Grid -->
      <div *ngIf="!loading && slots.length > 0" class="slots-grid">
        <mat-card *ngFor="let slot of slots; trackBy: trackBySlotId" 
                  class="slot-card" 
                  [class.active-slot]="slot.is_active">
          
          <!-- Card Header com Imagem do Dinossauro -->
          <div class="dinosaur-image-container">
            <img [src]="getDinosaurImage(slot)" 
                 [alt]="getCharacterName(slot)"
                 class="dinosaur-image"
                 (error)="onImageError($event)">
            <div class="slot-overlay" *ngIf="slot.is_active">
              <mat-chip color="accent" selected>
                <mat-icon>star</mat-icon>
                Slot Ativo
              </mat-chip>
            </div>
          </div>

          <mat-card-header>
            <mat-icon mat-card-avatar [class.active-icon]="slot.is_active">
              {{ slot.is_active ? 'casino' : 'casino_outline' }}
            </mat-icon>
            <mat-card-title>{{ slot.slot_name }}</mat-card-title>
            <mat-card-subtitle>
              {{ getCharacterName(slot) }}
              <span *ngIf="slot.error" class="error-text">{{ slot.error }}</span>
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <!-- Informações do Slot -->
            <div *ngIf="slot.slot_data && !slot.error" class="slot-info">
              <!-- Status Básico -->
              <div class="info-section">
                <h4>Status</h4>
                <div class="status-grid">
                  <div class="status-item">
                    <mat-icon color="warn">favorite</mat-icon>
                    <span>Vida: {{ slot.slot_data.Health }}%</span>
                  </div>
                  <div class="status-item">
                    <mat-icon color="primary">restaurant</mat-icon>
                    <span>Fome: {{ slot.slot_data.Hunger }}%</span>
                  </div>
                  <div class="status-item">
                    <mat-icon>local_drink</mat-icon>
                    <span>Sede: {{ slot.slot_data.Thirst }}%</span>
                  </div>
                  <div class="status-item">
                    <mat-icon>directions_run</mat-icon>
                    <span>Stamina: {{ slot.slot_data.Stamina }}%</span>
                  </div>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Progressão -->
              <div class="info-section">
                <h4>Progressão</h4>
                <div class="progression-info">
                  <p><mat-icon>trending_up</mat-icon> Growth: {{ slot.slot_data.Growth }}</p>
                  <p><mat-icon>science</mat-icon> DNA: {{ slot.slot_data.DNA || 'N/A' }}</p>
                  <p><mat-icon>star</mat-icon> Pontos: {{ slot.slot_data.ProgressionPoints }}</p>
                  <p><mat-icon>military_tech</mat-icon> Tier: {{ slot.slot_data.ProgressionTier }}</p>
                </div>
              </div>

              <!-- Status Adicional -->
              <div class="info-section" *ngIf="hasAdditionalStatus(slot)">
                <mat-divider></mat-divider>
                <h4>Status Adicional</h4>
                <div class="additional-status">
                  <mat-chip *ngIf="slot.slot_data.bBrokenLegs" color="warn">
                    <mat-icon>accessibility_new</mat-icon>
                    Pernas Quebradas
                  </mat-chip>
                  <mat-chip *ngIf="slot.slot_data.bIsResting" color="primary">
                    <mat-icon>hotel</mat-icon>
                    Descansando
                  </mat-chip>
                  <mat-chip>
                    <mat-icon>{{ slot.slot_data.bGender ? 'male' : 'female' }}</mat-icon>
                    {{ slot.slot_data.bGender ? 'Macho' : 'Fêmea' }}
                  </mat-chip>
                </div>
              </div>
            </div>

            <!-- Estado de Slot Vazio -->
            <div *ngIf="!slot.slot_data || slot.error" class="empty-slot">
              <mat-icon>block</mat-icon>
              <p>{{ slot.error || 'Slot vazio' }}</p>
            </div>
          </mat-card-content>

          <mat-card-actions>
            <button mat-raised-button 
                    color="primary" 
                    (click)="changeSlot(slot)"
                    [disabled]="slot.is_active || loading"
                    [matTooltip]="slot.is_active ? 'Este slot já está ativo' : 'Trocar para este slot'">
              <mat-icon>{{ slot.is_active ? 'check_circle' : 'swap_horiz' }}</mat-icon>
              {{ slot.is_active ? 'Slot Ativo' : 'Trocar Slot' }}
            </button>
          </mat-card-actions>
        </mat-card>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && slots.length === 0" class="empty-state">
        <mat-icon>casino_outline</mat-icon>
        <h3>Nenhum slot disponível</h3>
        <p>Não foi possível carregar seus slots.</p>
      </div>
    </div>
  `,
  styles: [`
    .slots-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px;
    }
    
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 24px;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 48px;
      color: #666;
    }
    
    .loading-container p {
      margin-top: 16px;
    }
    
    .slots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .slot-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
      overflow: hidden;
    }
    
    .slot-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .slot-card.active-slot {
      border: 2px solid #ff6600;
      box-shadow: 0 0 20px rgba(255, 102, 0, 0.3);
    }
    
    .dinosaur-image-container {
      position: relative;
      width: 100%;
      height: 200px;
      background: linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%);
      overflow: hidden;
    }
    
    .dinosaur-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 16px;
    }
    
    .slot-overlay {
      position: absolute;
      top: 16px;
      right: 16px;
    }
    
    mat-card-header {
      padding: 16px;
    }
    
    .active-icon {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      color: white;
    }
    
    .error-text {
      color: #f44336;
      font-style: italic;
      display: block;
      font-size: 12px;
      margin-top: 4px;
    }
    
    mat-card-content {
      flex: 1;
      padding: 16px;
    }
    
    .slot-info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .info-section {
      margin-bottom: 12px;
    }
    
    .info-section h4 {
      margin: 0 0 12px 0;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .status-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    
    .status-item mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .progression-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .progression-info p {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    
    .progression-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #666;
    }
    
    .additional-status {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 8px;
    }
    
    .additional-status mat-chip {
      font-size: 12px;
    }
    
    mat-divider {
      margin: 16px 0;
    }
    
    .empty-slot {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: #999;
    }
    
    .empty-slot mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
    }
    
    .empty-slot p {
      margin: 0;
      font-size: 14px;
    }
    
    .empty-state {
      text-align: center;
      padding: 64px;
      color: #666;
    }
    
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      margin: 16px 0 8px;
    }
    
    mat-card-actions {
      padding: 16px;
      justify-content: center;
    }
    
    @media (max-width: 768px) {
      .slots-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }
      
      .status-grid {
        grid-template-columns: 1fr;
      }
      
      .dinosaur-image-container {
        height: 150px;
      }
    }
    
    @media (max-width: 480px) {
      .slots-container {
        padding: 8px;
      }
      
      h1 {
        font-size: 24px;
        margin-bottom: 16px;
      }
      
      .slot-card {
        margin: 0;
      }
    }
  `]
})
export class SlotsLegacyComponent implements OnInit, OnDestroy {
  private readonly slotsService = inject(SlotsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  
  slots: Slot[] = [];
  loading = false;
  
  private subscriptions = new Subscription();
  private readonly serverId = GlobalConstants.server_id;
  private readonly cooldownMinutes = 5; // Cooldown padrão em minutos

  ngOnInit(): void {
    this.initializeSubscriptions();
    this.loadSlots();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.slotsService.clearState();
  }

  private initializeSubscriptions(): void {
    // Inscreve-se no observable de slots
    this.subscriptions.add(
      this.slotsService.slots$.subscribe({
        next: (slots) => this.slots = slots,
        error: (error) => console.error('Erro na subscription de slots:', error)
      })
    );

    // Inscreve-se no observable de loading
    this.subscriptions.add(
      this.slotsService.loading$.subscribe({
        next: (loading) => this.loading = loading,
        error: (error) => console.error('Erro na subscription de loading:', error)
      })
    );
  }

  private loadSlots(): void {
    this.slotsService.loadUserSlots(this.serverId).subscribe({
      next: (slots) => {
        console.log('Slots carregados:', slots);
      },
      error: (error) => {
        console.error('Erro ao carregar slots:', error);
        
        if (error.type === 'NO_STEAM_ID') {
          // Abre o diálogo de Steam não vinculado
          this.dialog.open(NoSteamDialogComponent, {
            disableClose: true,
            width: '400px'
          });
        } else {
          this.snackBar.open(
            error.message || 'Erro ao carregar slots',
            'Fechar',
            { duration: 5000 }
          );
        }
      }
    });
  }

  changeSlot(targetSlot: Slot): void {
    if (targetSlot.is_active || this.loading) {
      return;
    }

    const activeSlot = this.slotsService.getActiveSlot();
    if (!activeSlot) {
      this.snackBar.open('Nenhum slot ativo encontrado', 'Fechar', { duration: 3000 });
      return;
    }

    // Abre o diálogo de confirmação
    const dialogRef = this.dialog.open(ConfirmSlotChangeDialogComponent, {
      width: '500px',
      data: {
        fromSlot: activeSlot.slot_name,
        toSlot: targetSlot.slot_name,
        cooldownMinutes: this.cooldownMinutes
      }
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.performSlotChange(targetSlot.slot_id);
      }
    });
  }

  private performSlotChange(toSlotId: string): void {
    this.slotsService.changeSlot(this.serverId, toSlotId).subscribe({
      next: (response) => {
        this.snackBar.open(
          response.message || 'Slot trocado com sucesso!',
          'Fechar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Erro ao trocar slot:', error);
        
        if (error.type === 'COOLDOWN') {
          // Abre o diálogo de cooldown
          this.dialog.open(CooldownDialogComponent, {
            width: '400px',
            data: {
              remainingSeconds: error.remainingTime,
              message: error.message
            },
            disableClose: true
          });
        } else {
          this.snackBar.open(
            error.message || 'Erro ao trocar de slot',
            'Fechar',
            { duration: 5000 }
          );
        }
      }
    });
  }

  getDinosaurImage(slot: Slot): string {
    const characterClass = slot.slot_data?.CharacterClass || 'Free Slot';
    return this.slotsService.getDinosaurImage(characterClass);
  }

  getCharacterName(slot: Slot): string {
    if (slot.error) {
      return 'Slot com erro';
    }
    return slot.slot_data?.CharacterClass || 'Slot Vazio';
  }

  hasAdditionalStatus(slot: Slot): boolean {
    if (!slot.slot_data) return false;
    return slot.slot_data.bBrokenLegs || slot.slot_data.bIsResting || true; // sempre mostra gênero
  }

  onImageError(event: any): void {
    // Fallback para imagem padrão em caso de erro
    event.target.src = '/assets/images/dinosaurs/default.png';
  }

  trackBySlotId(index: number, slot: Slot): string {
    return slot.slot_id;
  }
}