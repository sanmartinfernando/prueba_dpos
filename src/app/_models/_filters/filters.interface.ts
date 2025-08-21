/**
 * @interface AddFields
 * @description
 * Define un filtro para agregar campos específicos.
 */
interface AddFields {
  $addFields: {
    created_at_formatted: {
      $toDate: string;
    },
  };
}

/**
 * @interface Unwind
 * @description
 * Define un filtro para descomponer un array en resultados individuales.
 */
interface Unwind {
  $unwind: string;
}

/**
 * @interface Match
 * @description
 * Define un filtro para filtrar los resultados según condiciones específicas.
 */
interface Match {
  $match: {
    terminal_number: { $in: string[] };
    commerce_id?: { $eq: number };
    type?: number;
    created_at: { $gte: number; $lte: number };
  };
}

/**
 * @interface Group
 * @description
 * Define un filtro para agrupar los resultados y calcular totales, promedios, conteos u otros valores agregados.
 */
interface Group {
  $group: {
    _id: string | { $month: string } | { month: { $month: string }; type: string };
    count?: { $sum: number };
    avg?: { $avg: string };
    total?: { $sum: string };
    quantity?: { $sum: string };
    product?: { $first: string };
    decimals?: { $first: string };
    created_at?: { $first: string };
    created_at_formatted?: { $first: string };
    unitsMeasurement?: { $first: string };
  };
}

/**
 * @interface Sort
 * @description
 * Define un filtro para ordenar los resultados según campos específicos.
 */
interface Sort {
  $sort: {
    _id?: number;
    quantity?: number;
  };
}

/**
 * @interface Limit
 * @description
 * Define un paso de agregación para limitar el número de resultados devueltos.
 */
interface Limit {
  $limit: number;
}

/**
 * Tipo que representa cualquier paso de agregación posible en un filtro.
 */
export type FilterStep = AddFields | Unwind | Match | Group | Sort | Limit;
