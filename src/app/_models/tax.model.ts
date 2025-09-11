/**
 * @class Tax
 * @description
 * Representa un impuesto con sus propiedades, tipos y valores.
 */
export class Tax {

  static readonly EXEMPT_NAME = "Exento";
  static readonly NO_APPLY_NAME = "No Sujeto";
  static readonly TYPE_IVA = 0;
  static readonly TYPE_IVA_NAME = "IVA";
  static readonly TYPE_IGIC = 1;
  static readonly TYPE_IGIC_NAME = "IGIC";
  static readonly TYPE_IPSI = 2;
  static readonly TYPE_IPSI_NAME = "IPSI";
  static readonly TYPE_OTHER = 10;
  static readonly TYPE_OTHER_NAME = "IVA";
  static readonly EXEMPT_VALUE = -1;
  static readonly NO_APPLY_VALUE = -2;

  static readonly TAXES: Tax[] =[{id:1,	taxName: "IVA 21%", taxType: 0,	taxValue: 2100},
                              {id:2,	taxName: "IVA 10%", taxType: 0, taxValue: 1000},
                              {id:3,	taxName: "IVA 4%", taxType: 0, taxValue: 400},
                              {id:4,	taxName: "Exento", taxType: -1, taxValue: -1},
                              {id:5,	taxName: "No Sujeto", taxType: -1, taxValue: -2},
                              {id:6,	taxName: "IVA 2%", taxType: 0, taxValue: 200},
                              {id:7,	taxName: "IVA 7,5%", taxType: 0, taxValue: 750},
                              {id:8,	taxName: "IGIC 0%", taxType: 1, taxValue: 0},
                              {id:9,	taxName: "IGIC 3%", taxType: 1, taxValue: 300},
                              {id:10, taxName: "IGIC 5%", taxType: 1, taxValue: 500},
                              {id:11, taxName: "IGIC 7%", taxType: 1, taxValue: 700},
                              {id:12, taxName: "IGIC 9,5%", taxType: 1, taxValue: 950},
                              {id:13, taxName: "IGIC 15%", taxType: 1, taxValue: 1500},
                              {id:14, taxName: "IGIC 20%", taxType: 1,taxValue: 2000},
                              {id:15, taxName: "IPSI 0,5%", taxType: 2, taxValue: 50},
                              {id:16, taxName: "IPSI 1%", taxType: 2,taxValue: 100},
                              {id:17, taxName: "IPSI 2%", taxType: 2, taxValue: 200},
                              {id:18, taxName: "IPSI 4%", taxType: 2, taxValue: 400},
                              {id:19, taxName: "IPSI 8%", taxType: 2, taxValue: 800},
                              {id:20, taxName: "IPSI 10%", taxType: 2, taxValue: 1000}];
  id: number;
  taxValue: number;
  taxName: string;
  taxType?: number;
  isDefault?: boolean;
  deleted?: boolean;
  selected?: boolean = false;
}
