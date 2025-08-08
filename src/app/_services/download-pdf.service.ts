import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';

@Injectable({
  providedIn: 'root',
})
export class DownloadPDFService {

  constructor(private http: HttpClient) { }

  public downloadBalancesFile(id: string): void {
    const apiUrl = `${environment.urlWS}${RestRoutes.BALANCES}${id}/download`;
    this.http.get(apiUrl, { responseType: 'blob' }).subscribe((response) => {
      this.saveFile(response, id);
    });
  }

  public downloadOrdersFile(id: string): void {
    const apiUrl = `${environment.urlWS}${RestRoutes.ORDERS}${id}/download`;
    this.http.get(apiUrl, { responseType: 'blob' }).subscribe((response) => {
      this.saveFile(response, id);
    });
  }

  private saveFile(blob: Blob, id: string): void {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = id + '.pdf';
    link.click();
  }
}
