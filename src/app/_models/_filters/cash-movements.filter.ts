import { FilterStep } from "./filters.interface";

/**
 * CashMovementsFilter construye filtros para consultas de movimientos de caja.
 * Permite filtrar por comercio, terminales y rango de fechas.
 */
export class CashMovementsFilter {

  public idCashMovement: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  /**
   * Inicializa un nuevo filtro de movimientos de caja.
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

    this.idCashMovement = [
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
          total: { $sum: '$amount' },
          decimals: { $first: '$decimals' },
        },
      },
    ];
  }

  /**
   * Convierte el filtro de movimientos de caja a JSON.
   * 
   * @returns Una cadena JSON que representa el filtro de movimientos de caja.
   */
  toJSON(): string {
    return JSON.stringify(this.idCashMovement);
  }
}
