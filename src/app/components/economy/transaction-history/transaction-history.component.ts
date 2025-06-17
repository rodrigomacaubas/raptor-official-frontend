import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TransactionDetailDialog } from './transaction-detail-dialog.component';

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
    CommonModule, MatCardModule, MatTableModule, MatIconModule,
    MatButtonModule, MatChipsModule, MatPaginatorModule, MatDialogModule
  ],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
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
    autoTable(doc, { head: [cols], body: rows });
    doc.save(`extrato_${Date.now()}.pdf`);
  }
}
