export class PhoneUtil {

    static formatPhone(ddd: string, numero: string): string {
      if (!ddd || !numero) return '';
  

      const numeroCompleto = ddd + numero;
      const numeroSomenteDigitos = numeroCompleto.replace(/\D/g, ''); 
        
      if (numeroSomenteDigitos.length === 11) {
        return `(${numeroSomenteDigitos.substring(0, 2)}) ${numeroSomenteDigitos.substring(2, 7)}-${numeroSomenteDigitos.substring(7, 11)}`;
      }
  
      return numeroSomenteDigitos;
    }

    static undoFormatting(telefone: string): { ddd: string, numero: string } {
        const telefoneSemFormatacao = telefone.replace(/\D/g, '');
        const ddd = telefoneSemFormatacao.substring(0, 2);
        const numero = telefoneSemFormatacao.substring(2);
    
        return { ddd, numero };
      }
  
  }
  