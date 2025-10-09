/**
 * @class OperationsReport
 * @description
 * Representa un informe de ventas con rango de fechas, moneda y agregaciones de datos.
 */
export class OperationsReport {
      
  fromDate: number;
  toDate: number;
  currency: string;
  aggregations: OperationsReportAggregations;
}

/**
 * @class OperationsReportAggregations
 * @description
 * Contiene los totales agregados de ventas por producto.
 */
export class OperationsReportAggregations {

  product: string;
  units: number;
  total: number;
}
