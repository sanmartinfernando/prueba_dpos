import { Order } from "./order.model";

/**
 * @class OrderInfo
 * @description
 * Contiene información paginada de ventas.
 */
export class OrderInfo {

  size: number;
  offset: number;
  total: number;
  data: Order[];
}
