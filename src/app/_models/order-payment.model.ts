/**
 * @class OrderPayment
 * @description
 * Representa un pago de una venta, incluyendo información como el importe, moneda, tarjeta,
 * estado de la transacción, tipo de pago y fechas de creación y actualización.
 */
export class OrderPayment {
  
  orderPaymentId: string;
  amount: number;
  income: number;
  change: number;
  currency: null;
  name: string;
  paymentDate: string;
  transactionId: string;
  transactionStatus: string;
  authorizationId: string;
  cardBrand: string;
  cardPan: string;
  type: number;
  decimals: number;
  createdAt: number;
  updatedAt: number;
}
