import { Tax } from "./tax.model";

/**
 * @class TaxInfo
 * @description
 * Representa la información paginada de impuestos.
 */
export class TaxInfo {

  size: number;
  offset: number;
  total: number;
  data: Tax[];
}
