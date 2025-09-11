import { TranslateService } from "@ngx-translate/core";

export abstract class TaxRegimen {
  
  static readonly TYPE_TBAI_IVA = 0;
  static readonly PREFIX_TBAI_IVA = '';

  static readonly TYPE_VERIFACTU_IVA = 1;
  static readonly PREFIX_VERIFACTU_IVA = 'VERIFACTU_IVA_';

  static readonly TYPE_VERIFACTU_IGIC = 2;
  static readonly PREFIX_VERIFACTU_IGIC = 'VERIFACTU_IGIC_';

  static readonly TAX_REGIMEN_CODE_NONE = '';
  static readonly DEFAULT_CODE_NAME_ID = -1;
  static readonly DEFAULT_CODE_NAME = '';

  public code: string;
  public enabled: boolean = false;
  public type: number;

  constructor(code: string) {
    this.code = code;
  }

  abstract getTaxRegimen(id: string): TaxRegimen;
  abstract getTaxRegimenName(codeTaxRegimen: string, translate: TranslateService): string;
  abstract getTaxRegimens(): TaxRegimen[];
}

export class TBAIIVATaxRegimen extends TaxRegimen {

  static readonly TAX_REGIMEN_CODE_01 = TaxRegimen.PREFIX_TBAI_IVA + "01";
  static readonly TAX_REGIMEN_CODE_02 = TaxRegimen.PREFIX_TBAI_IVA + "02";
  static readonly TAX_REGIMEN_CODE_03 = TaxRegimen.PREFIX_TBAI_IVA + "03";
  static readonly TAX_REGIMEN_CODE_04 = TaxRegimen.PREFIX_TBAI_IVA + "04";
  static readonly TAX_REGIMEN_CODE_05 = TaxRegimen.PREFIX_TBAI_IVA + "05";
  static readonly TAX_REGIMEN_CODE_06 = TaxRegimen.PREFIX_TBAI_IVA + "06";
  static readonly TAX_REGIMEN_CODE_07 = TaxRegimen.PREFIX_TBAI_IVA + "07";
  static readonly TAX_REGIMEN_CODE_08 = TaxRegimen.PREFIX_TBAI_IVA + "08";
  static readonly TAX_REGIMEN_CODE_09 = TaxRegimen.PREFIX_TBAI_IVA + "09";
  static readonly TAX_REGIMEN_CODE_10 = TaxRegimen.PREFIX_TBAI_IVA + "10";
  static readonly TAX_REGIMEN_CODE_11 = TaxRegimen.PREFIX_TBAI_IVA + "11";
  static readonly TAX_REGIMEN_CODE_12 = TaxRegimen.PREFIX_TBAI_IVA + "12";
  static readonly TAX_REGIMEN_CODE_13 = TaxRegimen.PREFIX_TBAI_IVA + "13";
  static readonly TAX_REGIMEN_CODE_14 = TaxRegimen.PREFIX_TBAI_IVA + "14";
  static readonly TAX_REGIMEN_CODE_15 = TaxRegimen.PREFIX_TBAI_IVA + "15";
  static readonly TAX_REGIMEN_CODE_19 = TaxRegimen.PREFIX_TBAI_IVA + "19";
  static readonly TAX_REGIMEN_CODE_51 = TaxRegimen.PREFIX_TBAI_IVA + "51";
  static readonly TAX_REGIMEN_CODE_52 = TaxRegimen.PREFIX_TBAI_IVA + "52";


  constructor (code: string) {
    super(code);
    this.type = TaxRegimen.TYPE_TBAI_IVA;
  }

  public override getTaxRegimen(id: string): TaxRegimen {
    switch (id.trim()) {
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_01:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_02:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_03:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_04:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_05:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_06:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_07:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_08:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_09:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_10:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_11:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_12:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_13:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_14:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_15:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_19:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_51:
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_52:
        return new TBAIIVATaxRegimen(id);
      default:
        return new TBAIIVATaxRegimen(TBAIIVATaxRegimen.TAX_REGIMEN_CODE_NONE);
    }
  }

  public override getTaxRegimenName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_01:
          return translate.instant("dpos.tax-regimen.code.01");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_02:
          return translate.instant("dpos.tax-regimen.code.02");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_03:
          return translate.instant("dpos.tax-regimen.code.03");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_04:
          return translate.instant("dpos.tax-regimen.code.04");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_05:
          return translate.instant("dpos.tax-regimen.code.05");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_06:
          return translate.instant("dpos.tax-regimen.code.06");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_07:
          return translate.instant("dpos.tax-regimen.code.07");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_08:
          return translate.instant("dpos.tax-regimen.code.08");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_09:
          return translate.instant("dpos.tax-regimen.code.09");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_10:
          return translate.instant("dpos.tax-regimen.code.10");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_11:
          return translate.instant("dpos.tax-regimen.code.11");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_12:
          return translate.instant("dpos.tax-regimen.code.12");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_13:
          return translate.instant("dpos.tax-regimen.code.13");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_14:
          return translate.instant("dpos.tax-regimen.code.14");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_15:
          return translate.instant("dpos.tax-regimen.code.15");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_19:
          return translate.instant("dpos.tax-regimen.code.19");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_51:
          return translate.instant("dpos.tax-regimen.code.51");
      case TBAIIVATaxRegimen.TAX_REGIMEN_CODE_52:
          return translate.instant("dpos.tax-regimen.code.52");
      default:
          return translate.instant("dpos.tax-regimen.code.none");
    }
  }

  public override getTaxRegimens(): TaxRegimen[]{
    const taxRegimen: TaxRegimen[] = [];
    taxRegimen.push(new TBAIIVATaxRegimen(TBAIIVATaxRegimen.TAX_REGIMEN_CODE_01));
    taxRegimen.push(new TBAIIVATaxRegimen(TBAIIVATaxRegimen.TAX_REGIMEN_CODE_19));
    taxRegimen.push(new TBAIIVATaxRegimen(TBAIIVATaxRegimen.TAX_REGIMEN_CODE_51));
    taxRegimen.push(new TBAIIVATaxRegimen(TBAIIVATaxRegimen.TAX_REGIMEN_CODE_52));    
    return taxRegimen;
  }
}

export class VerifactuIVATaxRegimen extends TaxRegimen {

  static readonly TAX_REGIMEN_CODE_01 = TaxRegimen.PREFIX_VERIFACTU_IVA + "01";
  static readonly TAX_REGIMEN_CODE_19 = TaxRegimen.PREFIX_VERIFACTU_IVA + "19";
  static readonly TAX_REGIMEN_CODE_18 = TaxRegimen.PREFIX_VERIFACTU_IVA + "18";
  static readonly TAX_REGIMEN_CODE_20 = TaxRegimen.PREFIX_VERIFACTU_IVA + "20";

  constructor (code: string) {
    super(code);
    this.type = TaxRegimen.TYPE_VERIFACTU_IVA;
  }

  public override getTaxRegimen(id: string): TaxRegimen  {
    switch (id.trim()) {
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_01:
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_19:
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_18:
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_20:
        return new TBAIIVATaxRegimen(id);
      default:
        return new TBAIIVATaxRegimen(VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_NONE);
    }
  }
  
  public override getTaxRegimenName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_01:
        return translate.instant("dpos.tax-regimen.code.01");
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_19:
        return translate.instant("dpos.tax-regimen.code.19");
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_18:
        return translate.instant("dpos.tax-regimen.code.51");
      case VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_20:
        return translate.instant("dpos.tax-regimen.code.52");
      default:
        return translate.instant("dpos.tax-regimen.code.none");
    }
  }

  public override getTaxRegimens(): TaxRegimen[] {
    const taxRegimen: TaxRegimen[] = [];
    taxRegimen.push(new VerifactuIVATaxRegimen(VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_01));
    taxRegimen.push(new VerifactuIVATaxRegimen(VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_19));
    taxRegimen.push(new VerifactuIVATaxRegimen(VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_18));
    taxRegimen.push(new VerifactuIVATaxRegimen(VerifactuIVATaxRegimen.TAX_REGIMEN_CODE_20));
    return taxRegimen;
  }
}

export class VerifactuIGICTaxRegimen extends TaxRegimen {

  static readonly  TAX_REGIMEN_CODE_01 = TaxRegimen.PREFIX_VERIFACTU_IGIC + "01";

  constructor(code: string) {
    super(code);
    this.type = TaxRegimen.TYPE_VERIFACTU_IGIC;
  }

  public override getTaxRegimen(id: string): TaxRegimen {
    switch (id.trim()) {
      case VerifactuIGICTaxRegimen.TAX_REGIMEN_CODE_01:
        return new TBAIIVATaxRegimen(id);
      default:
        return new TBAIIVATaxRegimen(VerifactuIGICTaxRegimen.TAX_REGIMEN_CODE_NONE);
    }
  }

  public override getTaxRegimenName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case VerifactuIGICTaxRegimen.TAX_REGIMEN_CODE_01:
        return translate.instant("dpos.tax-regimen.code.01");
        default:
      return translate.instant("dpos.tax-regimen.code.none");
    }
  }

  public override getTaxRegimens(): TaxRegimen[] {
    const totalTaxsRegimen: TaxRegimen[] = [];
    totalTaxsRegimen.push(new VerifactuIGICTaxRegimen(VerifactuIGICTaxRegimen.TAX_REGIMEN_CODE_01));
    return totalTaxsRegimen;
  }
}
