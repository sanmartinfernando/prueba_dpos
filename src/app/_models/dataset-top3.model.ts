/**
 * Representa un elemento con un nombre y un valor numérico,
 * utilizado para mostrar los tres productos más vendidos.
 */
export class DataSetTop3 {
  
  public name: string;
  public value: number;

  constructor(name: string, value: number) {
    this.name = name;
    this.value = value;
  }

}
