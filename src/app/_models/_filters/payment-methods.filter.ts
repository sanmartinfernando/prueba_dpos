import { FilterStep } from "./filters.interface";

export class PaymentMethodsFilter {

  public idPaymentMethods: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  constructor(terminalsId: string[], commerceId: number, fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idPaymentMethods = [
      {
        $unwind: '$order_payments',
      },
      {
        $match: {
          terminal_number: { $in: this.terminalsId },
          commerce_id: { $eq: this.commerceId },
          created_at: { $gt: this.fromDate, $lt: this.toDate },
        },
      },
      {
        $group: {
          _id: '$order_payments.name',
          count: { $sum: 1 },
        },
      },
    ];
  }

  toJSON(): string {
    return JSON.stringify(this.idPaymentMethods);
  }
}
