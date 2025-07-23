import { Category } from "./category.model";
import { Modifiers } from "./modifiers.model";
import { Tax } from "./tax.model";

export class Product {

  static readonly NO_ID = "-1";
  static readonly TYPE_NORMAL = 0;
  static readonly TYPE_VARIABLE_PRICE = 1;
  
  id: string;
  name: string;
  price: number;
  type: number;
  favourite: boolean;
  tax: Tax;
  taxExemptCode: string;
  categories: Category[];
  modifiers: Modifiers[];
  taxRegimen: string;
  epigraph: string;
  noticeKitchen: boolean;
  unitMeasurement: number;
  decorationCategory: string;
  decorationElement: string;
  selected:boolean = false;
}
