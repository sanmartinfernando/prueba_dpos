import { Tax } from "./tax.model";

/**
 * @enum UnitMeasurement
 * @description
 * Enumeración que representa las unidades de medida disponibles
 * para productos.
 */
export enum UnitMeasurement {
  Unit = 0,
  Kilogram = 1,
  Meter = 2,
  Liter = 3
}

/**
 * Mapa que asocia cada valor de {@link UnitMeasurement}
 * con su representación textual abreviada.
 */
export const UnitMeasurementLabel: Record<UnitMeasurement, string> = {
  [UnitMeasurement.Unit]: "ud.",
  [UnitMeasurement.Kilogram]: "kg.",
  [UnitMeasurement.Meter]: "m.",
  [UnitMeasurement.Liter]: "l."
};

/**
 * @enum PriceType
 * @description
 * Enumeración que representa los tipos de precio (fijo o variable) disponibles
 * para productos.
 */
export enum PriceType {
  Normal = 0,
  Variable = 1
}

/**
 * Mapa que asocia cada valor de {@link PriceType}
 * con su representación textual abreviada.
 */
export const PriceTypeLabel: Record<PriceType, string> = {
  [PriceType.Normal]: "Precio fijo",
  [PriceType.Variable]: "Precio variable"
};

/**
 * @class Product
 * @description
 * Representa un producto con sus propiedades, impuestos, categorías y modificadores asociados.
 */
export class Product {

  static readonly NO_ID = "-1";

  productId: string;
  name: string;
  price: number;
  type: PriceType;
  favourite = false;
  categories: string[] = [];
  modifiers: string[] = [];
  epigraph: string;
  noticeKitchen = false;
  unitMeasurement: number;
  stock: number;
  noticeBar = false;
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
