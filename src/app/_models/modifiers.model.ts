/**
 * Representa un conjunto de modificadores asociados a un elemento,
 * incluyendo su identificador, nombre y la lista de modificadores separados.
 */
export class Modifiers {

  static readonly MODIFIERS_SEPARATOR = ";";

  id: string;
  name: string;
  modifiers: string;
}
