export class ArqueoX {
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
    postalCode: number;
    city: string;
    state: string;
    country: string;
    phone: number;
    email: string;
    commerceNumber: number
  };
  balanceLines: [
    {
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
      unitMeasurement: number
    },
    {
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
    },
    {
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
  ];
  terminalUid: string;
  terminalNumber: number;
  appVersion: string;
  reseller: string
}
