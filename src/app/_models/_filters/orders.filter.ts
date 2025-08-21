import { FilterStep } from "./filters.interface";

/**
 * @class OrdersFilter
 * @description
 * Construye filtros para consultas de ventas.
 */
export class OrdersFilter {

  public idOrders: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  /**
   * Inicializa un nuevo filtro para consultas de ventas.
   * 
   * @param commerceId - Identificador del comercio.
   * @param terminalsId - Lista de identificadores de terminales (opcional).
   * @param fromDate - Fecha de inicio del filtro en milisegundos (opcional, valor por defecto: 1704063600000).
   * @param toDate - Fecha de fin del filtro en milisegundos (opcional, valor por defecto: 1735686000000).
   */
  constructor(commerceId: number, terminalsId?: string[], fromDate?: number, toDate?: number) {

    this.terminalsId = terminalsId;
    this.commerceId = commerceId;
    this.fromDate = fromDate ?? 1704063600000;
    this.toDate = toDate ?? 1735686000000;

    this.idOrders = [
      {
        $match: {
          terminal_number: { $in: this.terminalsId },
          commerce_id: { $eq: this.commerceId },
          created_at: { $gte: this.fromDate, $lte: this.toDate },
        },
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          avg: { $avg: '$total' },
          total: { $sum: '$total' },
          decimals: { $first: '$decimals' },
        },
      },
    ];
  }

  /**
   * Convierte el filtro de ventas a JSON.
   * 
   * @returns Una cadena JSON que representa el filtro de ventas.
   */
  public toJSON(): string {
    return JSON.stringify(this.idOrders);
  }
}
