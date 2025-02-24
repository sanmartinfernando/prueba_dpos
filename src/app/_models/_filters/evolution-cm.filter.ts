import { FilterStep } from "./filters.interface";

export class EvolutionCMFilter {

  public idEvoCashMovement: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  constructor(terminalsId: string[], commerceId: number, fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.commerceId = commerceId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idEvoCashMovement = [
      {
        $addFields: {
          created_at_formatted: {
            $toDate: '$created_at',
          },
        },
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
          _id: {
            month: {
              $month: '$created_at_formatted',
            },
            type: '$type',
          },
          total: {
            $sum: '$amount',
          },
          avg: {
            $avg: '$amount',
          },
          count: {
            $sum: 1,
          },
          created_at: {
            $first: '$created_at',
          },
          created_at_formatted: {
            $first: '$created_at_formatted',
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ];
  }

  toJSON(): string {
    return JSON.stringify(this.idEvoCashMovement);
  }
}
