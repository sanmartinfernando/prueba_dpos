import { FilterStep } from "./filters.interface";

/**
 * @class TopProductsFilter
 * @description
 * Construye filtros para obtener los productos más vendidos.
 */
export class TopProductsFilter {

  public idTopProducts: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  /**
   * Inicializa un nuevo filtro para la consulta de productos más vendidos.
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
    this.idTopProducts = [
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
          _id: null,
          quantity: {
            $sum: '$order_lines.quantity',
          },
        },
      },
    ];
  }

  /**
   * Convierte el filtro de productos más vendidos a JSON.
   * 
   * @returns Una cadena JSON que representa el filtro consulta de productos más vendidos.
   */
  public toJSON(): string {
    return JSON.stringify(this.idTopProducts);
  }
}
