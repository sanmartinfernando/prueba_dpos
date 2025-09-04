import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Epigraph } from '../_models/epigraph.model';

/**
 * @class EpigraphsService
 * @description
 * Servicio para gestionar la obtención de epígrafes.
 */
@Injectable({ providedIn: 'root' })
export class EpigraphsService {
  
  private http = inject(HttpClient);

  /**
   * Obtiene el listado de epígrafes.
   * 
   * @returns Observable con el listado de epigrafes.
   */
  public getEpigraphs(): Observable<Epigraph[]> {
    
    const filePath = 'assets/files/epigraphs.csv';
    return this.http.get(filePath, { responseType: 'text' }).pipe(
      map(data => {
        // 1. Dividimos el texto en líneas.
        const lines = data.split('\n');
        // 2. Eliminamos la primera línea (la cabecera) y las líneas vacías.
        const bodyLines = lines.slice(1).filter(line => line.trim() !== '');
        // 3. Mapeamos cada línea restante a un objeto Epigraph.
        return bodyLines.map(line => {
          const [codigo, descEs, descEu] = line.split(';');
          return {
            codigo: codigo.trim(),
            descripcionES: descEs.trim(),
            descripcionEU: descEu.trim()
          };
        });
      }),
      catchError(error => {
        console.error('Error al leer el archivo:', error);
        return throwError(() => new Error('No se pudo cargar la lista de actividades.'));
      })
    );
  }
}
