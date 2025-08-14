import { FilterStep } from "./filters.interface";

/**
 * EvolutionCMFilter construye filtros para el gráfico de evolución de movimientos de caja.
 */
export class EvolutionCMFilter {

  public idEvoCashMovement: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  /**
   * Inicializa un nuevo filtro para el gráfico de evolución de movimientos de caja.
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
          created_at: { $gte: this.fromDate, $lte: this.toDate },
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

  /**
   * Convierte el filtro de evolución de movimientos de caja a JSON.
   * 
   * @returns Una cadena JSON que representa el filtro de evolución de movimientos de efectivo.
   */
  public toJSON(): string {
    return JSON.stringify(this.idEvoCashMovement);
  }
}
