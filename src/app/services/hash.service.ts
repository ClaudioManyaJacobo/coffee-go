import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HashService {
  // Alfabeto mezclado para ofuscación (actúa como clave)
  private readonly alphabet = 'w7PQRS0123456789bcDeFgHiJkLmNoPqRsTuVwXyZ-_AbCdEfGhIjKlMnOpQrStUvWxYz';
  private readonly minLength = 6;

  /**
   * Codifica un ID numérico a un Hash profesional
   */
  encode(id: number | string | undefined): string {
    if (id === undefined) return '';
    let num = Number(id);
    if (isNaN(num) || num === 0) return String(id);
    
    let hash = '';
    const base = this.alphabet.length;

    while (num > 0) {
      hash = this.alphabet[num % base] + hash;
      num = Math.floor(num / base);
    }

    return hash.padStart(this.minLength, this.alphabet[0]);
  }

  /**
   * Decodifica el Hash de vuelta al ID real de TMDB
   */
  decode(hash: string | null): string {
    if (!hash) return '';
    const base = this.alphabet.length;
    let num = 0;
    
    // Eliminamos el relleno (padding) del inicio
    const cleanHash = hash.replace(new RegExp(`^${this.alphabet[0]}+`), '');
    
    for (let i = 0; i < cleanHash.length; i++) {
      const charIndex = this.alphabet.indexOf(cleanHash[i]);
      if (charIndex === -1) return hash; 
      num = num * base + charIndex;
    }

    return num.toString();
  }
}
