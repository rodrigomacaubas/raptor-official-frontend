import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.css']
})
export class TransferComponent {
  recipient = '';
  currencyType = '';
  amount = 0;
  message = '';

  transfer() {
    console.log('Transfer:', {
      recipient: this.recipient,
      currencyType: this.currencyType,
      amount: this.amount,
      message: this.message
    });
  }

  cancel() {
    this.recipient = '';
    this.currencyType = '';
    this.amount = 0;
    this.message = '';
  }
}
