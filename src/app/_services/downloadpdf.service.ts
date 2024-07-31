import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DownloadPDFService {
  constructor(private http: HttpClient) {}

  downloadFile(id:string): void {
    const apiUrl = 'https://dpos.diusframi.tech:39443/wstickets/api/Balances/'+id+'/download'; // Cambia la URL según tu API
    this.http.get(apiUrl, { responseType: 'blob' }).subscribe((response) => {
      this.saveFile(response, id);
    });
  }

  private saveFile(blob: Blob, id:string): void {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = id+'.pdf'; // Cambia el nombre según el archivo
    link.click();
  }
}
