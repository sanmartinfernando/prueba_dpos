/**
 * Representa una línea de venta, incluyendo información del producto, cantidades,
 * precios, impuestos, descuentos, modificadores y notas de cocina.
 */
export class OrderLine {
  
  orderLineId: string;
  rowNumber: number;
  productId: number;
  productName: string;
  productUnitMeasurement: number;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxAmount: number;
  taxValue: number;
  taxExemptCode: string;
  taxName: string;
  subTotal: number;
  subTotalTaxes: number;
  total: number;
  totalTaxes: number;
  taxesDiscount: number;
  totalDiscount: number;
  orderLineParentId: string;
  productTaxRegimen: string;
  productEpigraph: string;
  orderModifiers: [];
  noticeKitchen: string;
  decimals: number;
}
