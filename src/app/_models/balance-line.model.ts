/**
 * Representa una línea de cierre de caja con información como el identificador de la línea, valores monetarios,
 * porcentajes, impuestos y otros datos relacionados con el cierre de caja.
 */
export class BalanceLine {

  static readonly TYPE_TAX: number = 1;
  static readonly TYPE_PAYMENT_METHOD: number = 2;
  static readonly TYPE_CARD_BRAND: number = 3;
  static readonly TYPE_TIPS: number = 4;

  balanceLineId: string;
  balanceId: string;
  rowOrder: number;
  itemType: number;
  itemName: string;
  itemValue: number;
  base: number;
  tax: number;
  total: number;
  percentage: number;
  count: number;
  taxExemptCode: string;
  decimals: number;
  unitMeasurement: number;
}
