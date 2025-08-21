import { Product } from "./product.model";

/**
 * @class ProductInfo
 * @description
 * Contenedor de información de productos paginados.
 */
export class ProductInfo {

  size: number;
  offset: number;
  total: number;
  data: Product[];
}
