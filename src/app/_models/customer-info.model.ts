import { Customer } from "./customer.model";

/**
 * @class CustomerInfo
 * @description
 * Contiene información paginada de clientes.
 */
export class CustomerInfo {
  total: number;
  data: Customer[];
  size: number;
  nextToken: string;
}
