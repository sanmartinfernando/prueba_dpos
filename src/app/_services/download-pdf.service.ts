import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';

/**
 * @class DownloadPDFService
 * @description
 * Servicio para descargar archivos PDF relacionados con cierres de caja y ventas.
 */
@Injectable({ providedIn: 'root' })
export class DownloadPDFService {
  
  private http = inject(HttpClient);

  /**
   * Descarga el archivo PDF correspondiente a un cierre de caja por su ID.
   * 
   * @param id Identificador del cierre de caja.
   */
  public downloadBalancesFile(id: string): void {
    const apiUrl = `${environment.urlWS}${RestRoutes.BALANCES}${id}/download`;
    this.http.get(apiUrl, { responseType: 'blob' }).subscribe((response) => {
      this.saveFile(response, id);
    });
  }

  /**
   * Descarga el archivo PDF correspondiente a una venta por su ID.
   * 
   * @param id Identificador de la venta.
   */
  public downloadOrdersFile(id: string): void {
    const apiUrl = `${environment.urlWS}${RestRoutes.ORDERS}${id}/download`;
    this.http.get(apiUrl, { responseType: 'blob' }).subscribe((response) => {
      this.saveFile(response, id);
    });
  }

  /**
   * Guarda un archivo PDF en el sistema del usuario.
   * 
   * @param blob Archivo en formato Blob.
   * @param id Nombre base del archivo.
   */
  private saveFile(blob: Blob, id: string): void {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${id}.pdf`;
    link.click();
  }
}
