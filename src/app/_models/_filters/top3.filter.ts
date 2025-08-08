import { FilterStep } from "./filters.interface";


export class Top3Filter {

  public idTop3: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  constructor(commerceId: number, terminalsId?: string[], fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.commerceId = commerceId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idTop3 = [
      {
        $match: {
          terminal_number: { $in: this.terminalsId },
          commerce_id: { $eq: this.commerceId },
          created_at: { $gte: this.fromDate, $lte: this.toDate },
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
          unitsMeasurement: {
            $first: '$order_lines.product_unit_measurement',
          },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      }
    ];
  }

  toJSON(): string {
    return JSON.stringify(this.idTop3);
  }
}
