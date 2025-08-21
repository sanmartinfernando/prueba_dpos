/**
 * @class SalesReport
 * @description
 * Representa un informe de ventas con rango de fechas, moneda y agregaciones de datos.
 */
export class SalesReport {
      
  fromDate: number;
  toDate: number;
  currency: string;
  aggregations: SalesReportAggregations;
}

/**
 * @class SalesReportAggregations
 * @description
 * Contiene los totales agregados de ventas por producto.
 */
export class SalesReportAggregations {

  product: string;
  units: number;
  total: number;
}
