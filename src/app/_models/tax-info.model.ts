import { Tax } from "./tax.model";

/**
 * Representa la información paginada de impuestos.
 */
export class TaxInfo {

  size: number;
  offset: number;
  total: number;
  data: Tax[];
}
