import { OrderCommerce } from "./order-commerce.model";
import { OrderLine } from "./order-line.model";
import { OrderPayment } from "./order-payment.model";
import { OrderTax } from "./order-tax.model";
import { OrderTicketBai } from "./order-ticketbai.model";
import { OrderVerifactu } from "./order-verifactu.model";


export class Order {

  static readonly TYPE_SALE = 0;
  static readonly TYPE_INVOICE = 1;
  static readonly TYPE_REFUND = 2;
  static readonly TYPE_GIFT = 3;
  static readonly TYPE_PROFORMA = 4;
  static readonly TYPE_RECTIFY = 5;

  orderId: string;
  currency: string;
  reference: string;
  type: number;
  status: number;
  subTotal: number;
  subTotalTaxes: number;
  taxesDiscount: number;
  total: number;
  totalDiscount: number;
  totalTaxes: number;
  decimals: number;
  createdAt: number;
  updatedAt: number;
  finishedAt: number;
  itemsCount: number;
  parentOrderId: string;
  indexedAt: string;
  orderLines: OrderLine[];
  orderTaxes: OrderTax[];
  orderPayments: OrderPayment[];
  orderCommerce: OrderCommerce;
  orderCustomer: string;
  orderTicketBai: OrderTicketBai;
  orderVerifactu: OrderVerifactu;
  orderDiscounts: string;
  childs: string;
  hash: string;
  terminalUid: string;
  terminalNumber: number;
  appVersion: string;
  reseller: string;
}
