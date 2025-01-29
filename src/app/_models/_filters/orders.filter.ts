import { FilterStep } from "./filters.interface";

export class OrdersFilter {

  public idOrders: FilterStep[];
  private terminalsId: string[];
  private fromDate: number;
  private toDate: number;

  constructor(terminalsId: string[], fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idOrders = [
      { 
        $unwind: '$order_payments' 
      },
      {
        $match: {
          terminal_number: { $in: this.terminalsId },
          created_at: { $gt: this.fromDate, $lt: this.toDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avg: { $avg: '$total' },
          total: { $sum: '$total' },
          decimals: { $first: '$decimals' },
        },
      },
    ];
  }

  toJSON(): string {
    return JSON.stringify(this.idOrders);
  }
}