import { Product } from "./product.model";

/**
 * Contenedor de información de productos paginados.
 */
export class ProductInfo {

  size: number;
  offset: number;
  total: number;
  data: Product[];
}
