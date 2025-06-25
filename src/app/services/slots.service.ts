// src/app/services/slots.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface SlotData {
  BleedingRate: string;
  CharacterClass: string;
  DNA: string;
  Growth: string;
  Health: string;
  Hunger: string;
  Location_Isle_V3: string;
  Location_Thenyaw_Island: string;
  Oxygen: string;
  ProgressionPoints: string;
  ProgressionTier: string;
  Rotation_Isle_V3: string;
  Rotation_Thenyaw_Island: string;
  Stamina: string;
  Thirst: string;
  UnlockedCharacters: string;
  bBrokenLegs: boolean;
  bGender: boolean;
  bIsResting: boolean;
}

export interface Slot {
  slot_id: string;
  slot_name: string;
  slot_number: number;
  is_active: boolean;
  slot_data?: SlotData;
  error?: string;
}

export interface SlotsResponse {
  slots?: Slot[];
  user_slots?: Slot[];
  message?: string;
  error?: string;
}

export interface ChangeSlotRequest {
  to_slot_id: string;
}

export interface ChangeSlotResponse {
  message: string;
  data?: {
    user_id: string;
    server_id: string;
    previous_active_slot_id: string;
    new_active_slot_id: string;
  };
  error?: string;
  remaining_time_seconds?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SlotsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api';
  
  private slotsSubject = new BehaviorSubject<Slot[]>([]);
  public slots$ = this.slotsSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  private cooldownSubject = new BehaviorSubject<number>(0);
  public cooldown$ = this.cooldownSubject.asObservable();

  /**
   * Lista ou cria slots do usuário
   */
  loadUserSlots(serverId: string): Observable<Slot[]> {
    this.loadingSubject.next(true);
    
    return this.http.get<SlotsResponse>(`${this.baseUrl}/servers/${serverId}/user_slots`).pipe(
      map(response => {
        // A API pode retornar slots ou user_slots dependendo do estado
        const slots = response.slots || response.user_slots || [];
        return slots;
      }),
      tap(slots => {
        this.slotsSubject.next(slots);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Erro ao carregar slots:', error);
        
        // Se for erro de SteamID não configurado
        if (error.error?.error?.includes('SteamID not set')) {
          return throwError(() => ({
            type: 'NO_STEAM_ID',
            message: 'Você precisa vincular sua conta Steam antes de acessar os slots.'
          }));
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Troca o slot ativo
   */
  changeSlot(serverId: string, toSlotId: string): Observable<ChangeSlotResponse> {
    this.loadingSubject.next(true);
    
    const body: ChangeSlotRequest = { to_slot_id: toSlotId };
    
    return this.http.post<ChangeSlotResponse>(
      `${this.baseUrl}/servers/${serverId}/change_slot`, 
      body
    ).pipe(
      tap(response => {
        this.loadingSubject.next(false);
        
        // Atualiza os slots localmente
        if (response.data) {
          const currentSlots = this.slotsSubject.value;
          const updatedSlots = currentSlots.map(slot => ({
            ...slot,
            is_active: slot.slot_id === response.data!.new_active_slot_id
          }));
          this.slotsSubject.next(updatedSlots);
        }
        
        // Recarrega os slots para obter dados atualizados
        this.loadUserSlots(serverId).subscribe();
      }),
      catchError(error => {
        this.loadingSubject.next(false);
        console.error('Erro ao trocar slot:', error);
        
        // Se for erro de cooldown
        if (error.status === 429 && error.error?.remaining_time_seconds) {
          this.cooldownSubject.next(error.error.remaining_time_seconds);
          return throwError(() => ({
            type: 'COOLDOWN',
            message: error.error.message,
            remainingTime: error.error.remaining_time_seconds
          }));
        }
        
        // Se for erro de conflito (já está no slot)
        if (error.status === 409) {
          return throwError(() => ({
            type: 'CONFLICT',
            message: error.error.message || 'Você já está neste slot'
          }));
        }
        
        return throwError(() => ({
          type: 'GENERAL',
          message: error.error?.message || 'Erro ao trocar de slot'
        }));
      })
    );
  }

  /**
   * Obtém o slot ativo atual
   */
  getActiveSlot(): Slot | null {
    const slots = this.slotsSubject.value;
    return slots.find(slot => slot.is_active) || null;
  }

  /**
   * Obtém um slot específico pelo ID
   */
  getSlotById(slotId: string): Slot | null {
    const slots = this.slotsSubject.value;
    return slots.find(slot => slot.slot_id === slotId) || null;
  }

  /**
   * Formata o tempo de cooldown para exibição
   */
  formatCooldownTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    return `${remainingSeconds}s`;
  }

  /**
   * Obtém a imagem do dinossauro baseado na classe
   */
  getDinosaurImage(characterClass: string): string {
    // Mapeamento de classes para imagens
    const imageMap: { [key: string]: string } = {
      'Free Slot': '/assets/images/dinosaurs/free-slot.png',
      'Utahraptor': '/assets/images/dinosaurs/utahraptor.png',
      'Dilophosaurus': '/assets/images/dinosaurs/dilophosaurus.png',
      'Tyrannosaurus': '/assets/images/dinosaurs/tyrannosaurus.png',
      'Allosaurus': '/assets/images/dinosaurs/allosaurus.png',
      'Carnotaurus': '/assets/images/dinosaurs/carnotaurus.png',
      'Ceratosaurus': '/assets/images/dinosaurs/ceratosaurus.png',
      'Giganotosaurus': '/assets/images/dinosaurs/giganotosaurus.png',
      'Spinosaurus': '/assets/images/dinosaurs/spinosaurus.png',
      'Suchomimus': '/assets/images/dinosaurs/suchomimus.png',
      'Baryonyx': '/assets/images/dinosaurs/baryonyx.png',
      'Pachycephalosaurus': '/assets/images/dinosaurs/pachycephalosaurus.png',
      'Parasaurolophus': '/assets/images/dinosaurs/parasaurolophus.png',
      'Gallimimus': '/assets/images/dinosaurs/gallimimus.png',
      'Diabloceratops': '/assets/images/dinosaurs/diabloceratops.png',
      'Triceratops': '/assets/images/dinosaurs/triceratops.png',
      'Maiasaura': '/assets/images/dinosaurs/maiasaura.png',
      'Dryosaurus': '/assets/images/dinosaurs/dryosaurus.png',
      'Stegosaurus': '/assets/images/dinosaurs/stegosaurus.png',
      'Kentrosaurus': '/assets/images/dinosaurs/kentrosaurus.png',
      'Ankylosaurus': '/assets/images/dinosaurs/ankylosaurus.png',
      'Therizinosaurus': '/assets/images/dinosaurs/therizinosaurus.png',
      'Orodromeus': '/assets/images/dinosaurs/orodromeus.png',
      'Austroraptor': '/assets/images/dinosaurs/austroraptor.png',
      'Herrerasaurus': '/assets/images/dinosaurs/herrerasaurus.png',
      'Dryo': '/assets/images/dinosaurs/dryosaurus.png',
      'Stego': '/assets/images/dinosaurs/stegosaurus.png',
      'Trike': '/assets/images/dinosaurs/triceratops.png',
      'Utah': '/assets/images/dinosaurs/utahraptor.png',
      'Dilo': '/assets/images/dinosaurs/dilophosaurus.png',
      'Rex': '/assets/images/dinosaurs/tyrannosaurus.png',
      'Allo': '/assets/images/dinosaurs/allosaurus.png',
      'Carno': '/assets/images/dinosaurs/carnotaurus.png',
      'Cera': '/assets/images/dinosaurs/ceratosaurus.png',
      'Giga': '/assets/images/dinosaurs/giganotosaurus.png',
      'Spino': '/assets/images/dinosaurs/spinosaurus.png',
      'Sucho': '/assets/images/dinosaurs/suchomimus.png',
      'Bary': '/assets/images/dinosaurs/baryonyx.png',
      'Pachy': '/assets/images/dinosaurs/pachycephalosaurus.png',
      'Para': '/assets/images/dinosaurs/parasaurolophus.png',
      'Galli': '/assets/images/dinosaurs/gallimimus.png',
      'Diablo': '/assets/images/dinosaurs/diabloceratops.png',
      'Maia': '/assets/images/dinosaurs/maiasaura.png',
      'Kento': '/assets/images/dinosaurs/kentrosaurus.png',
      'Anky': '/assets/images/dinosaurs/ankylosaurus.png',
      'Theri': '/assets/images/dinosaurs/therizinosaurus.png',
      'Oro': '/assets/images/dinosaurs/orodromeus.png',
      'Austro': '/assets/images/dinosaurs/austroraptor.png',
      'Herrera': '/assets/images/dinosaurs/herrerasaurus.png'
    };

    // Retorna a imagem correspondente ou uma imagem padrão
    return imageMap[characterClass] || '/assets/images/dinosaurs/default.png';
  }

  /**
   * Limpa o estado do serviço
   */
  clearState(): void {
    this.slotsSubject.next([]);
    this.loadingSubject.next(false);
    this.cooldownSubject.next(0);
  }
}