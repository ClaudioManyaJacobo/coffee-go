import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HashService {
  /**
   * GiMovie Secure ID System (Stable Edition)
   * Utiliza Base64-URL Safe para garantizar que todos los IDs,
   * incluyendo los de sugerencias, funcionen perfectamente.
   */
  
  private readonly PREFIX = 'cg_';

  /**
   * Codifica el ID a un formato Base64 protegida
   */
  encode(id: any): string {
    if (id === undefined || id === null) return '';
    const strId = String(id);
    
    // Obscurecer mínimamente agregando un valor prefijo interno
    const obs = `cgo_${strId}`;
    
    // Encode to Base64 and make it URL safe
    const base64 = btoa(obs);
    return this.PREFIX + base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  /**
   * Decodifica de vuelta al ID original
   */
  decode(hash: string | null): string {
    if (!hash || !hash.startsWith(this.PREFIX)) return '';

    try {
      let base64 = hash.substring(this.PREFIX.length)
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // Re-add padding
      while (base64.length % 4 !== 0) {
        base64 += '=';
      }

      const decoded = atob(base64);
      if (decoded.startsWith('cgo_')) {
        return decoded.substring(4);
      }
      return decoded;
    } catch (e) {
      console.error('GiMovie Trace: Decode failed', e);
      return '';
    }
  }
}
