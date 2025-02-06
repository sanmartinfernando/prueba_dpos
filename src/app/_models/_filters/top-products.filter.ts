import { FilterStep } from "./filters.interface";

export class TopProductsFilter {

  public idTopProducts: FilterStep[];
  private terminalsId: string[];
  private fromDate: number;
  private toDate: number;

  constructor(terminalsId: string[], fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idTopProducts = [
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
          _id: null,
          quantity: {
            $sum: '$order_lines.quantity',
          },
        },
      },
    ];

  }

  toJSON(): string {
    return JSON.stringify(this.idTopProducts);
  }
}
