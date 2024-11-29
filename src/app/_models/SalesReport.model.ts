export interface SalesReport {
fromDate: number;
toDate: number;
currency: string;
aggregations: {
      product: string;
      units: number;
      total: number;
 }
}
