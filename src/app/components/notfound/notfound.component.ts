import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
  styleUrls: ['./notfound.component.css']
})
export class NotfoundComponent implements OnInit {

  messages: string[] = [
    "Você entrou em uma era sem mapa... Volte antes que um dinossauro te adote.",
    "Página não encontrada. Até os meteoros sabem onde ir, menos você!",
    "O T-Rex roubou seu caminho. Tente novamente ou fuja rapidamente.",
    "Oops! Este link sumiu como a última vaga de estacionamento no Jurássico.",
    "Este caminho termina em extinção. Recomece sua jornada!",
    "A selva jurássica engoliu esta página. Cuidado com o mato grosso!",
    "Se bem me lembro, essa página não faz parte do nosso fóssil inicial.",
    "Erro 404: Aventura perdida na pré-história.",
    "Alguém soltou um 'roar' 404 por aqui. Você está perdido!",
    "Essa página foi devorada antes mesmo do meteoro chegar."
  ];

  ngOnInit(): void {
    this.typeMessages();
  }

  typeMessages(): void {
    const container = document.getElementById('message-container');
    if (!container) return;

    let messageIndex = 0;
    let charIndex = 0;
    let currentLineElement: HTMLDivElement | null = null;

    const typeNextChar = () => {
      if (messageIndex < this.messages.length) {
        const currentMessage = this.messages[messageIndex];

        if (charIndex === 0) {
          currentLineElement = document.createElement('div');
          currentLineElement.classList.add('message-line');
          container.appendChild(currentLineElement);
        }

        if (charIndex < currentMessage.length) {
          currentLineElement!.textContent += currentMessage.charAt(charIndex);
          charIndex++;
          setTimeout(typeNextChar, 40);
        } else {
          currentLineElement!.style.borderRight = 'none';
          charIndex = 0;
          messageIndex++;
          setTimeout(typeNextChar, 800);
        }
      }
    };

    typeNextChar();
  }
}
