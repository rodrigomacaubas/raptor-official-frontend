import { Component, OnInit, AfterViewInit, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
// corrigido: import padrão do jsPDF e import nomeado do plugin
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  description: string;
  amount: number;
  currency: string;
  date: Date;
  status: 'completed' | 'pending' | 'failed';
}

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatPaginatorModule,
    MatDialogModule
  ],
  template: `
    <div class="history-container">
      <h1>Extrato da Conta</h1>
      
      <mat-card class="history-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>receipt</mat-icon>
          <mat-card-title>Histórico de Transações</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <div class="export-buttons">
            <button mat-stroked-button (click)="exportCSV()">
              <mat-icon>file_download</mat-icon>
              Exportar CSV
            </button>
            <button mat-stroked-button (click)="exportPDF()">
              <mat-icon>picture_as_pdf</mat-icon>
              Exportar PDF
            </button>
          </div>

          <table mat-table [dataSource]="dataSource" class="transaction-table">
            <!-- Tipo -->
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Tipo</th>
              <td mat-cell *matCellDef="let tx">
                <mat-icon class="type-icon {{tx.type}}">
                  {{ getTypeIcon(tx.type) }}
                </mat-icon>
              </td>
            </ng-container>

            <!-- Descrição -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Descrição</th>
              <td mat-cell *matCellDef="let tx">{{ tx.description }}</td>
            </ng-container>

            <!-- Valor -->
            <ng-container matColumnDef="amount">
              <th mat-header-cell *matHeaderCellDef>Valor</th>
              <td mat-cell *matCellDef="let tx">
                <span class="amount {{tx.type}}">
                  {{ tx.type === 'expense' ? '-' : '+' }}{{ tx.amount }}
                  <mat-icon class="currency-icon">{{ getCurrencyIcon(tx.currency) }}</mat-icon>
                </span>
              </td>
            </ng-container>

            <!-- Data -->
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Data</th>
              <td mat-cell *matCellDef="let tx">{{ tx.date | date:'short' }}</td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let tx">
                <mat-chip class="status-chip {{tx.status}}">
                  {{ getStatusLabel(tx.status) }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Ações -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Ações</th>
              <td mat-cell *matCellDef="let tx">
                <button mat-icon-button (click)="openDetails(tx)">
                  <mat-icon>info</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .history-container { max-width: 1200px; margin: 0 auto; }
    .history-card { margin-top: 24px; }
    .export-buttons { display: flex; gap: 8px; margin-bottom: 16px; }
    .transaction-table { width: 100%; }
    .type-icon { font-size: 20px; }
    .type-icon.income { color: #4caf50; }
    .type-icon.expense { color: #f44336; }
    .type-icon.transfer { color: #2196f3; }
    .amount { font-weight: 500; display: inline-flex; align-items: center; gap: 4px; }
    .amount.income { color: #4caf50; }
    .amount.expense { color: #f44336; }
    .amount.transfer { color: #2196f3; }
    .currency-icon { font-size: 16px; width: 16px; height: 16px; }
    .status-chip { font-size: 12px; }
    .status-chip.completed { background: #e8f5e8; color: #2e7d32; }
    .status-chip.pending { background: #fff3e0; color: #f57c00; }
    .status-chip.failed { background: #ffebee; color: #c62828; }
    h1 {
      background: linear-gradient(45deg, #ff6600, #b71c1c);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  `]
})
export class TransactionHistoryComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['type', 'description', 'amount', 'date', 'status', 'actions'];
  dataSource = new MatTableDataSource<Transaction>([]);
  transactions: Transaction[] = [
    { id: '1', type: 'income', description: 'Recompensa de slot', amount: 500, currency: 'np', date: new Date('2025-06-08T10:30:00'), status: 'completed' },
    { id: '2', type: 'expense', description: 'Compra de skin', amount: 300, currency: 'np', date: new Date('2025-06-07T15:45:00'), status: 'completed' },
    { id: '3', type: 'transfer', description: 'Transferência para João', amount: 100, currency: 'vidas', date: new Date('2025-06-06T09:15:00'), status: 'pending' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.dataSource.data = this.transactions;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getTypeIcon(type: string): string {
    return { income: 'trending_up', expense: 'trending_down', transfer: 'swap_horiz' }[type] || 'help';
  }

  getCurrencyIcon(currency: string): string {
    return { np: 'toll', vidas: 'favorite', dna: 'science' }[currency] || 'help';
  }

  getStatusLabel(status: string): string {
    return { completed: 'Concluído', pending: 'Pendente', failed: 'Falhou' }[status] || status;
  }

  openDetails(tx: Transaction) {
    this.dialog.open(TransactionDetailDialog, { data: tx, width: '400px' });
  }

  exportCSV() {
    const rows = this.dataSource.filteredData.map(tx => ({
      Tipo: this.getStatusLabel(tx.type),
      Descrição: tx.description,
      Valor: tx.amount,
      Data: tx.date.toLocaleString(),
      Status: this.getStatusLabel(tx.status)
    }));
    const csv = [
      Object.keys(rows[0]).join(','),
      ...rows.map(r => Object.values(r).map(v => `"${v}"`).join(','))
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `extrato_${Date.now()}.csv`;
    link.click();
  }

  exportPDF() {
    const doc = new jsPDF();
    const cols = ['Tipo','Descrição','Valor','Data','Status'];
    const rows = this.dataSource.filteredData.map(tx => [
      this.getStatusLabel(tx.type),
      tx.description,
      (tx.type === 'expense' ? '−' : '+') + tx.amount,
      tx.date.toLocaleString(),
      this.getStatusLabel(tx.status)
    ]);
    // usa a função importada em vez de doc.autoTable
    autoTable(doc, { head: [cols], body: rows });
    doc.save(`extrato_${Date.now()}.pdf`);
  }
}

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
    @Inject(MAT_DIALOG_DATA) public data: Transaction
  ) {}
}
