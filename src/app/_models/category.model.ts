/**
 * @class Category
 * @description
 * Representa una categoría con su identificador, nombre y decoraciones.
 */
export class Category {

  categoryId: string;
  categoryName: string;
  decorationCategory?: string;
  decorationElement?: string;
  deleted?: boolean;
}
