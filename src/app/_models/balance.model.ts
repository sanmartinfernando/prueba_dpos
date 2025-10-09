import { BalanceCommerce } from "./balance-commerce.model";
import { BalanceLine } from "./balance-line.model";

/**
 * @class Balance
 * @description
 * Representa un cierre de caja que incluye información de ventas, devoluciones,
 * movimientos de caja, líneas de detalle y datos del terminal.
 */
export class Balance {

  static readonly REPORT_TYPE_TAXES = 0;
  static readonly REPORT_TYPE_PRODUCTS = 1;
  static readonly REPORT_TYPE_PM = 2;

  balanceId: string;
  reference: string;
  operations: number;
  refunds: number;
  in: number;
  out: number;
  inCount: number;
  outCount: number;
  opening: number;
  nextOpening: number;
  cashOperations: number;
  cashRefunds: number;
  autoCashRecount: number;
  manualCashRecount: number;
  total: number;
  operationsCount: number;
  refundsCount: number;
  rectifyCount: number;
  startedAt: number;
  finishedAt: number;
  currency: string;
  decimals: number;
  balanceCommerce: BalanceCommerce;
  balanceLines: BalanceLine[];
  terminalUid: string;
  terminalNumber: string;
  appVersion: string;
  reseller: string;
}
