export class BalanceId {
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
  balanceCommerce: {
    balanceCommerceId: string;
    name: string;
    tradeName: string;
    nif: string;
    address: string;
    postalCode: string;
    city: string;
    state: string;
    country: string;
    phone: string;
    email: string;
    commerceNumber: string;
  };
  balanceLines: [
    {
      balanceLineId: string;
      balanceId: string;
      rowOrder: number;
      itemType: number;
      itemName: string;
      itemValue: string;
      base: number;
      tax: number;
      total: number;
      percentage: number;
      count: number;
      taxExemptCode: null;
      decimals: number;
      unitMeasurement: number;
    },
    {
      balanceLineId: string;
      balanceId: string;
      rowOrder: number;
      itemType: number;
      itemName: string;
      itemValue: string;
      base: number;
      tax: number;
      total: number;
      percentage: number;
      count: number;
      taxExemptCode: null;
      decimals: number;
      unitMeasurement: number;
    }
  ];
  terminalUid: string;
  terminalNumber: string;
  appVersion: string;
  reseller: string;
}
