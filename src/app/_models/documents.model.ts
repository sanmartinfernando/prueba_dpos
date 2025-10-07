/**
 * @class Document
 * @description
 * Representa un documento con información básica como su identificador, nombre y fecha de inclusión.
 */
export class Document {

  // Identificadores o constantes de tipo si en el futuro las necesitas
  static readonly NO_ID = '-1';

  documentId: string;
  name: string;
  inclusionDate: string; // formato ISO o 'yyyy-MM-dd'
  url?: string;          // opcional, para enlace de descarga o vista
  deleted: boolean;

  constructor(init?: Partial<Document>) {
    Object.assign(this, init);
  }
}
