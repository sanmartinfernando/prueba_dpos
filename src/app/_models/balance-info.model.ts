import { Balance } from "./balance.model";

/**
 * BalanceInfo representa un listado de cierres de caja con información
 * de paginación.
 */
export class BalanceInfo {

  size: number;
  offset: number;
  total: number;
  data: Balance[];
}
