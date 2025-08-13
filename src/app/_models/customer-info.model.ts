import { Customer } from "./customer.model";

/**
 * Contiene información paginada de clientes.
 */
export class CustomerInfo {
  size: number;
  offset: number;
  total: number;
  data: Customer[];
}
