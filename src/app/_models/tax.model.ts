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

  id: number;
  value: number;
  name: string;
  type?: number;
  isDefault?: boolean;
  deleted?: boolean;
  selected?: boolean = false;
}
