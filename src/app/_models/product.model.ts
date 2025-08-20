import { Tax } from "./tax.model";

/**
 * Representa un producto con sus propiedades, impuestos, categorías y modificadores asociados.
 */
export class Product {

  static readonly NO_ID = "-1";
  static readonly TYPE_NORMAL = 0;
  static readonly TYPE_VARIABLE_PRICE = 1;

  productId: string;
  name: string;
  price: number;
  type: number;
  favourite: boolean = false;
  categories: string[] = [];
  modifiers: string[] = [];
  epigraph: string;
  noticeKitchen: boolean = false;
  unitMeasurement: number;
  stock: number;
  noticeBar: boolean = false;

  barcode?: string;
  reference?: string;
  description?: string;
  tax?: Tax;
  taxExemptCode?: string;
  taxRegimen?: string;
  salePrice?: number;
  startSalesPrice?: number;
  endSalesPrice?: number;
  decorationCategory?: string;
  decorationElement?: string;
  selected?: boolean = false;
}
