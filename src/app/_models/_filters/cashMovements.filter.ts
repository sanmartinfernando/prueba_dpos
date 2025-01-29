import { FilterStep } from "./filters.interface";

export class CashMovementsFilter {

  public idCM: FilterStep[];

  private terminalsId: string[];
  private fromDate: number;
  private toDate: number;

  constructor(terminalsId: string[], fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idCM = [
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
          total: { $sum: '$amount' },
          decimals: { $first: '$decimals' },
        },
      },
    ];
  }

  toJSON(): string {
    return JSON.stringify(this.idCM);
  }
}