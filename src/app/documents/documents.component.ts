import { Component, ElementRef, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { CommercesService } from '../_services/commerces.service';
import { DocumentsService } from '../_services/documents.service';
import { DownloadCsvService } from '../_services/download-csv.service';
import { EncryptionService } from '../_services/encryption.service';
import { SessionService } from '../_services/session.service';
import { ThemeService } from '../_services/theme.service';
import { UIStateService } from '../_services/ui-state.service';
import { Commerce } from '../_models/commerce.model';
import { Document } from '../_models/documents.model';
import { environment } from 'src/environments/environment';

type DocumentRow = Document & {
  _isApi?: boolean;
  _apiParams?: Record<string, string | number | boolean>;
};


/**
 * @class DocumentsComponent
 * @description
 * Componente para la gestión de documentos.
 * Permite búsqueda, importación, exportación, alta y baja de documentos.
 */
@Component({
  selector: 'app-dpos-documents',
  templateUrl: './documents.component.html',
})
export class DocumentsComponent implements OnInit, OnDestroy {

  private encryptionService = inject(EncryptionService);
  private downloadCsvService = inject(DownloadCsvService);
  private documentsService = inject(DocumentsService); // ver nota arriba
  private commercesService = inject(CommercesService);
  private translate = inject(TranslateService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private router = inject(Router);

  private readonly STATIC_DOC_URL_1 = environment.urlDocuments + 'Comercia/Declaracion_Responsable_TPVGO.pdf';
    private readonly STATIC_DOC_URL_2 = environment.urlDocuments + 'https://d1v0i5k89q4x6i.cloudfront.net/DPOS/Declaracion_Responsable_DPOS.pdf';

  private buildStaticDocumentsForReseller(): DocumentRow[] {
  const isComercia = this.isComercia; // ya lo calculas en loadCommerces()
  const url = isComercia ? this.STATIC_DOC_URL_1 : this.STATIC_DOC_URL_2;
  const name = isComercia
    ? 'Declaración Responsable TPV&GO VeriFactu'
    : 'Declaración Responsable DPOS VeriFactu';

  return [{
    documentId: isComercia ? 'static-comercia' : 'static-otros',
    name,
    inclusionDate: new Date().toISOString(),
    url,
    deleted: false
  }];
}

  Math: Math;

  size = 10;
  documents: DocumentRow[] = [];
  page = 0;
  code: string;
  loadCompleted = false;
  commerceId = 0;
  masterSelected = false;

  public terminalsNumber: string[];
  terminalSelected: string = null;
  searchCounter = false;
  varSearch: string = null;

  public openExternal(url: string, event?: MouseEvent): void {
  event?.stopPropagation(); // evita que se dispare el click del tr
  if (!url) return;
  window.open(url, '_blank', 'noopener'); // abre en nueva pestaña
}

  // Filtros DOCUMENTOS
  documentNameVarSearch: string = null;
  documentInclusionDateVarSearch: string = null; // yyyy-MM-dd

  emptySearch = false;
  showModal = false;
  modalTitle = '';
  modalMessage = '';
  showAcceptButton = false;
  showCancelButton = false;

  isComercia = false;

  // Guardamos la acción a ejecutar al aceptar en el modal
  acceptAction: (() => void) | null = null;

  @ViewChild('documentFileInput') documentFileInput!: ElementRef<HTMLInputElement>;

  currentLang: string;
  langSubscription: Subscription;

  commerceSelected: string;
  commerces: Commerce[];

  constructor() {
    this.uiStateService.setFormSelectEnabled(true);
    this.currentLang = this.translate.currentLang || 'es';
    this.langSubscription = this.translate.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
      this.terminalsNumber[0] = this.translate.instant('dpos.filter.all');
    });
  }

  /** Libera recursos. */
  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
  }

  /** Inicializa el componente cargando datos de sesión, comercios y documentos. */
  ngOnInit(): void {
    const urlDocuments = environment.urlDocuments;
    this.loadCompleted = false;
    this.restoreSearchParams();
    this.loadCommerces();
  }

  /** Ejecuta la búsqueda de documentos con los filtros actuales. */
  public searchDocuments(): void {
    this.loadCompleted = false;

    const filters = [
      { field: 'name', value: this.documentNameVarSearch, op: '=*.*' },
      { field: 'inclusionDate', value: this.documentInclusionDateVarSearch, op: '=' }
    ].filter(f => f.value);

    // Construimos el objeto "qs"
    const qsObject = filters.length > 0 ? { or: filters } : null;
    this.varSearch = qsObject ? JSON.stringify(qsObject) : null;
    this.getDocuments();
  }

  /**
   * Navega a la vista de detalle de un documento.
   * @param id Identificador del documento
   */
  public sendDocumentDetails(id: string): void {
    const route = id
      ? `/document-details/${this.encryptionService.encode(this.encryptionService.encryptData(id))}`
      : '/document-details';
    this.router.navigate([route]);
  }

  /** Lanza la acción para añadir un nuevo documento. */
  public addDocument(): void {
    this.sendDocumentDetails(null);
  }

  /** Abre el selector de archivos para importar documentos. */
  public importDocuments(): void {
    this.documentFileInput.nativeElement.click();
  }

  /**
   * Procesa un archivo CSV con datos de documentos.
   * @param event Evento de selección de archivo
   */
  public onDocumentFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const reader = new FileReader();
    reader.onload = () => this.processImportedCSV(reader.result as string);
    reader.readAsText(input.files[0]);
  }

  /** Exporta la lista de documentos en formato CSV. */
  public exportDocuments(): void {
    // Si tu servicio tiene un método específico para documentos, úsalo.
    // Si no, puedes reutilizar el de clientes ajustando cabeceras internamente.
    this.downloadCsvService.downloadDocumentsFile?.(
      this.documents,
      this.translate.instant('dpos.documents.page.title'),
      this.currentLang
    );
    // En caso de no existir, descomenta y adapta a tu método genérico:
    // this.downloadCsvService.downloadCustomersFile(this.documents as any, this.translate.instant('dpos.documents.page.title'), this.currentLang);
  }

  /** Elimina un documento de la lista por su ID. */
  public deleteDocument(documentId: string) {
    this.loadCompleted = false;
    this.documentsService.deleteDocument(documentId, this.commerceId.toString()).subscribe({
      next: () => {
        this.showModal = false; 
        this.loadCompleted = true;
        this.searchDocuments();
        this.openModal(
          this.translate.instant('dpos.document.details.modal.delete.title'),
          this.translate.instant('dpos.document.details.modal.delete.message')
        );
      },
      error: () => {
        this.showModal = false;
        this.loadCompleted = true;
        this.openModal(
          this.translate.instant('dpos.error.msg.general'),
          this.translate.instant('dpos.error.msg.service.document.delete')
        );
      }
    });
  }

  /** Abrir modal para eliminar */
  openDeleteModal(documentId: string, event: MouseEvent) {
    event.stopPropagation();
    this.showAcceptButton = true;
    this.showCancelButton = true;
    this.modalTitle = this.translate.instant('dpos.action.confirm');
    this.modalMessage = this.translate.instant('dpos.document.details.modal.delete.confirm');
    this.acceptAction = () => this.deleteDocument(documentId);
    this.showModal = true;
  }

  /** Acción genérica al aceptar modal */
  onAcceptModal() {
    if (this.acceptAction) {
      this.acceptAction();
      this.acceptAction = null;
    }
    this.showModal = false;
  }

  /** Abre el modal de mensajes estableciendo el título y el mensaje. */
  public openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showAcceptButton = false;
    this.showCancelButton = false;
    this.showModal = true;
  }

  /** Cierra la ventana modal. */
  public closeModal(): void {
    this.showModal = false;
  }

  /** Guarda en sesión el nombre del documento introducido. */
  public onDocumentNameChange(): void {
    this.sessionService.setItem('DOCUMENT_NAME', this.documentNameVarSearch);
  }

  /** Guarda en sesión la fecha de inclusión introducida. */
  public onDocumentInclusionDateChange(): void {
    this.sessionService.setItem('DOCUMENT_INCLUSION_DATE', this.documentInclusionDateVarSearch);
  }

  /** Limpia todos los campos de búsqueda y sincroniza cambios en la sesión. */
  public cleanFormFields(): void {
    this.documentNameVarSearch = '';
    this.documentInclusionDateVarSearch = '';
    this.onDocumentNameChange();
    this.onDocumentInclusionDateChange();
  }

  /** Restaura los parámetros de búsqueda desde la sesión. */
  private restoreSearchParams(): void {
    this.documentNameVarSearch = this.sessionService.getItem('DOCUMENT_NAME') ?? null;
    this.documentInclusionDateVarSearch = this.sessionService.getItem('DOCUMENT_INCLUSION_DATE') ?? null;
  }

  /** Carga la lista de comercios y configura el comercio activo. */
  private loadCommerces(): void {
    this.commercesService.getCommerceList().subscribe({
      next: commerces => {
        this.commerces = commerces;
        this.sessionService.getCommerceId().subscribe(commerceId => {
          this.commerceId = commerceId || commerces[0].commerceId;
          if (!commerceId) {
            this.sessionService.setItem(SessionService.COMMERCE_ID, this.commerceId);
          }
          this.isComercia = this.sessionService.getItem(SessionService.RESELLER_NAME) === Commerce.RESELLER_COMERCIA;
          this.themeService.loadTheme(this.getCommerceResellerName(commerces));
          this.commerceSelected = this.getCommerceNumber(this.commerceId);
          this.searchDocuments();
        });
      },
      error: error => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.commerces'));
        console.error('Error Commerces: ', error);
      }
    });
  }

  /** Obtiene la lista de documentos desde la llamada al servicio correspondiente. */
  /** Obtiene la lista de documentos desde la llamada al servicio correspondiente. */
/** Obtiene la lista de documentos desde la llamada al servicio correspondiente. */
private getDocuments(): void {
  this.emptySearch = true;
  this.loadCompleted = false;

  //Declaracion responsable
  const staticDoc = this.buildStaticDocumentsForReseller();

  // 📄 Documento que viene de la API Verifactu (se abrirá con token vía HttpClient → Blob)
  const apiDoc: DocumentRow = {
    documentId: 'api-001',
    name: 'Autorización de Representación Para Envío de Registros de Facturación a la AEAT',
    inclusionDate: new Date().toISOString(),
    url: null,            // 👈 importante: para que el HTML use la rama _isApi
    deleted: false,
    _isApi: true,         // 👈 flag que usa el HTML
    _apiParams: {         // 👈 params que necesita tu endpoint (ajústalos)
      ticketId: '12345',
      format: 'pdf'
    }
  };

  // 🧩 Llamada a la API de documentos normal
  this.documentsService
    .getDocuments(this.size, this.commerceId.toString(), this.varSearch)
    .subscribe({
      next: (documents) => {
  // Normalizamos SIEMPRE a DocumentRow para evitar el choque de tipos
  const base: DocumentRow[] = (documents?.data || []).map((d: any) => ({
    documentId: d.documentId ?? d.id ?? 'unknown',
    name: d.name ?? d.title ?? 'Documento',
    inclusionDate: d.inclusionDate ?? d.createdAt ?? new Date().toISOString(),
    url: d.url ?? d.fileUrl ?? d.link ?? null,
    deleted: !!d.deleted,  // forzamos booleano para cumplir el requerido
  }));

  this.documents = [ ...staticDoc, apiDoc, ...base ];
  this.emptySearch = this.documents.length === 0;
  this.loadCompleted = true;
},

      error: () => {
        // 👇 Si falla la API principal, mostramos el estático y el de la API Verifactu
        this.documents = [...staticDoc, apiDoc];
        this.emptySearch = this.documents.length === 0;
        this.loadCompleted = true;
      }
    });
}



  /** Procesa y agrega documentos desde el contenido de un CSV. */
  private processImportedCSV(text: string): void {
    const { rows, errors } = this.parseCSV(text);
    if (errors.length > 0) return;

    const imported = rows.map((row, i) => ({
      documentId: (i + 1).toString(),
      name: row[0],
      inclusionDate: row[1], // espera ISO o dd/MM/yyyy si luego lo normalizas
      url: row[2]
    } as DocumentRow));

    this.showModal = true;
    this.modalTitle = this.translate.instant('dpos.documents.import.title') || 'Importación de documentos';
    this.modalMessage = this.translate.instant('dpos.documents.import.success') || 'Documentos importados correctamente';
    this.documents = [...(this.documents || []), ...imported];
    this.emptySearch = this.documents.length === 0;
  }

  public openApiDoc(params: Record<string, string | number | boolean>, event?: MouseEvent) {
  event?.stopPropagation();

  this.documentsService.downloadRepresentationDocument(params).subscribe({
    next: (blob: Blob) => {
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },
    error: (err) => {
      console.error('Error descargando documento:', err);
    },
  });
}


  /** Obtiene el número de comercio correspondiente al ID. */
  private getCommerceNumber(commerceId: number): string {
    return this.commerces.find(c => c.commerceId === commerceId)?.commerceNumber ?? '';
  }

  /** Obtiene el nombre del reseller asociado al comercio activo. */
  private getCommerceResellerName(commerces: Commerce[]): string {
    return commerces.find(c => c.commerceId === this.commerceId)?.resellerName ?? null;
  }

  /** Parsea un CSV en filas y columnas. */
  private parseCSV(csv: string): { rows: string[][], errors: string[] } {
    const rows: string[][] = [];
    const errors: string[] = [];
    let currentRow: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      if (char === '"') {
        if (insideQuotes && csv[i + 1] === '"') { currentValue += '"'; i++; }
        else { insideQuotes = !insideQuotes; }
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentValue); currentValue = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && csv[i + 1] === '\n') i++;
        currentRow.push(currentValue);
        rows.push(currentRow);
        currentRow = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    if (currentValue !== '' || currentRow.length > 0) {
      currentRow.push(currentValue);
      rows.push(currentRow);
    }

    const expectedLength = rows[0]?.length ?? 0;
    rows.forEach((row, index) => {
      if (row.length !== expectedLength) {
        errors.push(`Error en la fila ${index + 1}: se esperaban ${expectedLength} columnas pero hay ${row.length}.`);
      }
    });
    return { rows, errors };
  }

}
