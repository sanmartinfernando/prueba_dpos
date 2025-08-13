/**
 * Representa un impuesto aplicado a una venta, incluyendo el identificador, nombre,
 * valor, base imponible, total, decimales y régimen fiscal.
 */
export class OrderTax {
  
  orderTaxId: string;
  currency: string;
  name: string;
  value: number;
  base: number;
  total: number;
  decimals: number;
  taxExemptCode: string;
  taxRegimen: string;
}
