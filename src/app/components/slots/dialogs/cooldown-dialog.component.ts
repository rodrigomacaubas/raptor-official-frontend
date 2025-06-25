// src/app/components/slots/dialogs/cooldown-dialog.component.ts
import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { interval, Subscription } from 'rxjs';

export interface CooldownDialogData {
  remainingSeconds: number;
  message: string;
}

@Component({
  selector: 'app-cooldown-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    <h2 mat-dialog-title>
      <mat-icon color="warn">timer</mat-icon>
      Cooldown Ativo
    </h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
      
      <div class="cooldown-timer">
        <mat-icon>schedule</mat-icon>
        <div class="timer-text">
          <span class="time">{{ formatTime(remainingTime) }}</span>
          <span class="label">tempo restante</span>
        </div>
      </div>
      
      <mat-progress-bar 
        mode="determinate" 
        [value]="progressValue"
        color="warn">
      </mat-progress-bar>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button (click)="close()">
        <mat-icon>close</mat-icon>
        Fechar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 350px;
      text-align: center;
    }
    
    h2 {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    
    .cooldown-timer {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin: 24px 0;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    
    .cooldown-timer mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ff6600;
    }
    
    .timer-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }
    
    .time {
      font-size: 32px;
      font-weight: 500;
      color: #ff6600;
    }
    
    .label {
      font-size: 14px;
      color: #666;
    }
    
    mat-progress-bar {
      margin-top: 16px;
    }
  `]
})
export class CooldownDialogComponent implements OnInit, OnDestroy {
  remainingTime: number;
  initialTime: number;
  progressValue: number = 0;
  private timerSubscription?: Subscription;

  constructor(
    private dialogRef: MatDialogRef<CooldownDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CooldownDialogData
  ) {
    this.remainingTime = data.remainingSeconds;
    this.initialTime = data.remainingSeconds;
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  startTimer(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.progressValue = ((this.initialTime - this.remainingTime) / this.initialTime) * 100;
      } else {
        this.close();
      }
    });
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  close(): void {
    this.dialogRef.close();
  }
}