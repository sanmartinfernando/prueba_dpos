import { FilterStep } from "./filters.interface";

/**
 * @class EvolutionFilter
 * @description
 * Construye filtros para el gráfico de evolución de ventas.
 */
export class EvolutionFilter {

  public idEvo: FilterStep[];
  private terminalsId: string[];
  private commerceId: number;
  private fromDate: number;
  private toDate: number;

  /**
   * Inicializa un nuevo filtro para el gráfico de evolución de ventas.
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

    this.idEvo = [
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
          type: 0,
          created_at: { $gte: this.fromDate, $lte: this.toDate },
        },
      },
      {
        $group: {
          _id: { $month: '$created_at_formatted' },
          total: { $sum: '$total' },
          avg: { $avg: '$total' },
          count: { $sum: 1 },
          created_at: { $first: '$created_at' },
          created_at_formatted: { $first: '$created_at_formatted' },
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
   * Convierte el filtro de evolución de ventas a JSON.
   * 
   * @returns Una cadena JSON que representa el filtro de evolución.
   */
  public toJSON(): string {
    return JSON.stringify(this.idEvo);
  }
}
