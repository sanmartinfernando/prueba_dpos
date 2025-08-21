import { Customer } from "./customer.model";

/**
 * @class CustomerInfo
 * @description
 * Contiene información paginada de clientes.
 */
export class CustomerInfo {
  size: number;
  offset: number;
  total: number;
  data: Customer[];
}
