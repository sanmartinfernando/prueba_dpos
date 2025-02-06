export class SalesReport {
      fromDate: number;
      toDate: number;
      currency: string;
      aggregations: SalesReportAggregations;
}

export class SalesReportAggregations {
      product: string;
      units: number;
      total: number;
}