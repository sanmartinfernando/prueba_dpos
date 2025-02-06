import { Order } from "./order.model";

export class OrderInfo {
  size: number;
  offset: number;
  total: number;
  data: Order[];
}
