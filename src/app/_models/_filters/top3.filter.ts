import { FilterStep } from "./filters.interface";

export class Top3Filter {

  public idT3: FilterStep[];

  private terminalsId: string[];
  private fromDate: number;
  private toDate: number;

  constructor(terminalsId: string[], fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idT3 = [
      {
        $match: {
          terminal_number: { $in: this.terminalsId },
          created_at: { $gt: this.fromDate, $lt: this.toDate },
          type: 0,
        },
      },
      {
        $unwind: '$order_lines',
      },
      {
        $group: {
          _id: '$order_lines.product_name',
          quantity: {
            $sum: '$order_lines.quantity',
          },
          product: {
            $first: '$order_lines.product_name',
          },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      },
      {
        $limit: 3,
      },
    ];
  }

  toJSON(): string {
    return JSON.stringify(this.idT3);
  }
}