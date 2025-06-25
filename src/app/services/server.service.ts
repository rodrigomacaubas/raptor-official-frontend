// src/app/services/server.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService, ServerBalanceResponse, Currency } from './api.service';

export interface CurrencyDisplay extends Currency {
  label: string;
  icon: string;
  value: number;
  class: string;
}

@Injectable({
  providedIn: 'root'
})
export class ServerService {
  private readonly apiService = inject(ApiService);
  
  // Estado do servidor atual
  private serverNameSubject = new BehaviorSubject<string>('Painel Raptor Cloud');
  public serverName$ = this.serverNameSubject.asObservable();
  
  // Estado das moedas
  private currenciesSubject = new BehaviorSubject<CurrencyDisplay[]>([]);
  public currencies$ = this.currenciesSubject.asObservable();
  
  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  
  // Server ID atual (você pode ajustar isso conforme necessário)
  private currentServerId = 'fd46f7d5-89fa-4dd0-9bf4-d9e023e241ce'; // NextLevel server ID

  /**
   * Carrega o saldo do usuário no servidor atual
   */
  loadServerBalance(serverId?: string): Observable<ServerBalanceResponse> {
    const serverToLoad = serverId || this.currentServerId;
    this.loadingSubject.next(true);
    
    return this.apiService.getServerBalance(serverToLoad).pipe(
      tap(response => {
        // Atualiza o nome do servidor
        this.serverNameSubject.next(response.server_name || 'Painel Raptor Cloud');
        
        // Mapeia as moedas para o formato esperado pelo app
        const mappedCurrencies = this.mapCurrenciesToAppFormat(response.balances);
        this.currenciesSubject.next(mappedCurrencies);
        
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Erro ao carregar saldo do servidor:', error);
        this.loadingSubject.next(false);
        
        // Define valores padrão em caso de erro
        this.serverNameSubject.next('Painel Raptor Cloud');
        this.currenciesSubject.next(this.getDefaultCurrencies());
        
        return of({
          message: 'Erro ao carregar dados',
          server_id: serverToLoad,
          server_name: 'Painel Raptor Cloud',
          user_id: '',
          balances: []
        });
      })
    );
  }
  
  /**
   * Mapeia as moedas do backend para o formato usado no app
   */
  private mapCurrenciesToAppFormat(balances: Currency[]): CurrencyDisplay[] {
    return balances.map(currency => {
      let icon = 'help';
      let cssClass = '';
      
      // Mapeia os ícones e classes baseado no nome ou tipo da moeda
      if (currency.currency_name.toLowerCase().includes('np') || 
          currency.currency_name.toLowerCase().includes('next points')) {
        icon = 'toll';
        cssClass = 'np';
      } else if (currency.currency_name.toLowerCase().includes('vida') || 
                 currency.currency_type === 'life') {
        icon = 'favorite';
        cssClass = 'vidas';
      } else if (currency.currency_name.toLowerCase().includes('dna')) {
        icon = 'science';
        cssClass = 'dna';
      }
      
      return {
        ...currency,
        label: currency.currency_name,
        icon: icon,
        value: currency.balance,
        class: cssClass
      };
    });
  }
  
  /**
   * Retorna moedas padrão quando não há dados do servidor
   */
  private getDefaultCurrencies(): CurrencyDisplay[] {
    return [
      {
        currency_id: '1',
        currency_name: 'NP',
        currency_type: 'point',
        is_active: true,
        balance: 0,
        label: 'NP',
        icon: 'toll',
        value: 0,
        class: 'np'
      },
      {
        currency_id: '2',
        currency_name: 'Vidas',
        currency_type: 'life',
        is_active: true,
        balance: 0,
        label: 'Vidas',
        icon: 'favorite',
        value: 0,
        class: 'vidas'
      },
      {
        currency_id: '3',
        currency_name: 'DNA',
        currency_type: 'point',
        is_active: true,
        balance: 0,
        label: 'DNA',
        icon: 'science',
        value: 0,
        class: 'dna'
      }
    ];
  }
  
  /**
   * Define o servidor atual
   */
  setCurrentServer(serverId: string): void {
    this.currentServerId = serverId;
    this.loadServerBalance(serverId).subscribe();
  }
  
  /**
   * Obtém o ID do servidor atual
   */
  getCurrentServerId(): string {
    return this.currentServerId;
  }
  
  /**
   * Atualiza o saldo de uma moeda específica (útil após transações)
   */
  updateCurrencyBalance(currencyId: string, newBalance: number): void {
    const currentCurrencies = this.currenciesSubject.value;
    const updatedCurrencies = currentCurrencies.map(currency => {
      if (currency.currency_id === currencyId) {
        return { ...currency, balance: newBalance, value: newBalance };
      }
      return currency;
    });
    this.currenciesSubject.next(updatedCurrencies);
  }
  
  /**
   * Recarrega os dados do servidor
   */
  refreshServerData(): Observable<ServerBalanceResponse> {
    return this.loadServerBalance();
  }
}