import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment.dev-inte';
import { RestRoutes } from '../_rest/rest-routes.config';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service'; 


/**
 * @interface Document
 * Estructura base de un documento.
 */
export interface Document {
  documentId: string;
  name: string;
  inclusionDate: string; // ISO 8601
  url?: string;
  deleted?: boolean;
}

/**
 * @interface DocumentInfo
 * Estructura del listado con metainformación (paginación, etc.).
 */
export interface DocumentInfo {
  data: Document[];
  totalCount?: number;
}

/**
 * @class DocumentsService
 * @description
 * Servicio para gestionar operaciones relacionadas con documentos.
 * Permite crear, actualizar, eliminar y consultar documentos.
 */
@Injectable({ providedIn: 'root' })
export class DocumentsService {

  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private tokenService = inject(TokenStorageService);
  private getAuthHeaders(): HttpHeaders {
    const token = this.tokenService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
       });
  }

  public httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /** Construye la URL completa de descarga del documento (GET con query params). */
public getRepresentationDocumentDownloadUrl(params: Record<string, string | number | boolean>): string {
  const base = `${environment.urlWS}${RestRoutes.VERIFACTU_REPRESENTATION_DOCUMENT_DOWNLOAD}`;

  let httpParams = new HttpParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
  });

  const qs = httpParams.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Descarga el documento como Blob (por si prefieres abrir desde blob URL). */
public downloadRepresentationDocument(params: Record<string, string | number | boolean>) {
    const url = `${environment.urlWS}${RestRoutes.VERIFACTU_REPRESENTATION_DOCUMENT_DOWNLOAD}`;

    let httpParams = new HttpParams();
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });

    return this.http.get(url, {
      params: httpParams,
      responseType: 'blob',
      headers: this.getAuthHeaders(), // 👈 añadimos el token aquí
    });
  }


  /**
   * Crea o actualiza un documento según tenga definido el documentId.
   * Si documentId no existe, se realiza un POST; de lo contrario, un PUT.
   * 
   * @param document Objeto Document con los datos del documento.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el documento creado o actualizado.
   */
  public saveDocument(document: Document, commerceId: string): Observable<Document> {
    if (!document || !commerceId || document.documentId === null) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = document.documentId
      ? `${environment.urlDocuments}${RestRoutes.DOCUMENT}/${document.documentId}`
      : `${environment.urlDocuments}${RestRoutes.DOCUMENT}`;

    return document.documentId
      ? this.http.put<Document>(url, document, { headers: this.httpOptions.headers, params })
      : this.http.post<Document>(url, document, { headers: this.httpOptions.headers, params });
  }

  /** Obtiene un documento externo (ejemplo). Ajusta la URL y el mapeo según tu API real. */
public getExternalDocument() {
  const url = '/api/verifactu/representation-document/download';
  return this.http.get<any>(url).pipe(
    catchError(() => of(null)) // si falla no rompe el flujo
  );
}

  /**
   * Elimina un documento por su ID.
   * 
   * @param documentId Id del documento a eliminar.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el resultado de la eliminación.
   */
  public deleteDocument(documentId: string, commerceId: string): Observable<number> {
    if (!documentId || !commerceId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }

    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlDocuments}${RestRoutes.DOCUMENT}/${documentId}`;
    return this.http.delete<number>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene un documento específico por su ID.
   * 
   * @param documentId Id del documento.
   * @param commerceId Id del comercio asociado.
   * @returns Observable con el documento obtenido.
   */
  public getDocument(documentId: string, commerceId: string): Observable<Document> {
    if (!documentId) {
      return throwError(() => new Error(this.translate.instant('dpos.error.msg.params')));
    }
    const params = new HttpParams().set('commerceId', commerceId);
    const url = `${environment.urlDocuments}${RestRoutes.DOCUMENT}/${documentId}`;
    return this.http.get<Document>(url, { headers: this.httpOptions.headers, params });
  }

  /**
   * Obtiene un listado de documentos según los parámetros de búsqueda.
   * 
   * @param size Cantidad de resultados a obtener.
   * @param commerceId ID del comercio. 
   * @param searchParams Parámetros de búsqueda (QS opcional).
   * @returns Observable con información de documentos.
   */
  public getDocuments(size: number, commerceId: string, qs?: string): Observable<DocumentInfo> {
    let params = new HttpParams()
      .set('size', size.toString())
      .set('offset', '0')
      .set('commerceId', commerceId);

    if (qs) {
      params = params.set('qs', qs);
    }

    return this.http.get<DocumentInfo>(`${environment.urlDocuments}${RestRoutes.DOCUMENTS_INFO}`, { params, ...this.httpOptions });
  }

  
}
