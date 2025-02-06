export class OrderCashAggregation {
  _id: {
    month: number,
    type: number
  }
  count: number;
  avg: number;
  total: number;
  decimals: number;
}
