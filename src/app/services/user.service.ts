import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Ajuste a URL base conforme seu backend
const API_BASE_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);

  // Exemplo de requisição GET autenticada
  getUserData(): Observable<any> {
    return this.http.get(`${API_BASE_URL}/url/user-profile`);
  }

  // Exemplo de requisição POST autenticada
  updateUserProfile(data: any): Observable<any> {
    return this.http.post(`${API_BASE_URL}/url/user-profile`, data);
  }

  // Exemplo de requisição para buscar transações
  getTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/transactions`);
  }

  // Exemplo de requisição para transferir moedas
  transferCurrency(data: {
    recipient: string;
    currencyType: string;
    amount: number;
    message?: string;
  }): Observable<any> {
    return this.http.post(`${API_BASE_URL}/transfer`, data);
  }
}