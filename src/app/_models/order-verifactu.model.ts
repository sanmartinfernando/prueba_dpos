/**
 * @enum VerifactuStatus
 * @description
 * Estados posibles de un proceso Verifactu.
 */
export enum VerifactuStatus {
  Pending = "PENDING",
  Processing = "PROCESSING",
  Completed = "COMPLETED",
  Accepted = "ACCEPTED_BY_AEAT",
  PartiallyAccepted = "PARTIALLY_ACCEPTED_BY_AEAT",
  Rejected = "REJECTED_BY_AEAT",
  Failed = "FAILED"
}

/**
 * @class OrderVerifactu
 * @description
 * Representa la información de Verifactu asociada a una venta,
 * incluyendo identificadores, URL, estados y advertencias.
 */
export class OrderVerifactu {

  orderVerifactuId: string;
  verifactuId: string;
  userReference: string;
  url: string;
  status: VerifactuStatus;
  warns: [];
  updatedAt: number;
  processingAt: number;
  acceptedAt: number;
  rejectedAt: number;
  failedAt: number;
  failedCause: string;
  retryAt: number;
}
