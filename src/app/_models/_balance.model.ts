import { BalanceCommerce } from "./balance-commerce.model";
import { BalanceLine } from "./balance-line.model";


export class Balance {
  balanceId: string;
  reference: string;
  sales: number;
  refunds: number;
  in: number;
  out: number;
  inCount: number;
  outCount: number;
  opening: number;
  nextOpening: number;
  cashSales: number;
  cashRefunds: number;
  autoCashRecount: number;
  manualCashRecount: number;
  total: number;
  salesCount: number;
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
