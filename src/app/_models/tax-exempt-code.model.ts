import { TranslateService } from "@ngx-translate/core";

export abstract class TaxExemptCode {
  
  static readonly TYPE_TBAI = 0;
  static readonly TYPE_VERIFACTU = 1;

  public code: string;
  public enabled = false;
  public type: number;

  constructor(code: string) {
    this.code = code;
  }

  abstract getTaxExemptCode(id: string): TaxExemptCode;
  abstract getTaxExemptCodeName(codeTaxRegimen: string, translate: TranslateService): string;
  abstract getTaxExemptCodes(): TaxExemptCode[];
}

export class TBAIExemptCode extends TaxExemptCode {

  static readonly EXEMPT_CODE_E1 = "E1";
  static readonly EXEMPT_CODE_E2 = "E2";
  static readonly EXEMPT_CODE_E3 = "E3";
  static readonly EXEMPT_CODE_E4 = "E4";
  static readonly EXEMPT_CODE_E5 = "E5";
  static readonly EXEMPT_CODE_E6 = "E6";
  static readonly EXEMPT_CODE_NONE = '';
  
  constructor (code: string) {
    super(code);
    this.type = TaxExemptCode.TYPE_TBAI;
  }

  public override getTaxExemptCode(id: string): TaxExemptCode {
    switch (id.trim()) {
      case TBAIExemptCode.EXEMPT_CODE_E1:
      case TBAIExemptCode.EXEMPT_CODE_E2:
      case TBAIExemptCode.EXEMPT_CODE_E3:
      case TBAIExemptCode.EXEMPT_CODE_E4:
      case TBAIExemptCode.EXEMPT_CODE_E5:
      case TBAIExemptCode.EXEMPT_CODE_E6:
        return new TBAIExemptCode(id);
      default:
        return new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_NONE);
    }
  }

  public override getTaxExemptCodeName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case TBAIExemptCode.EXEMPT_CODE_E1:
          return translate.instant("dpos.exempt-code.code.e1");
      case TBAIExemptCode.EXEMPT_CODE_E2:
          return translate.instant("dpos.exempt-code.code.e2");
      case TBAIExemptCode.EXEMPT_CODE_E3:
          return translate.instant("dpos.exempt-code.code.e3");
      case TBAIExemptCode.EXEMPT_CODE_E4:
          return translate.instant("dpos.exempt-code.code.e4");
      case TBAIExemptCode.EXEMPT_CODE_E5:
          return translate.instant("dpos.exempt-code.code.e5");
      case TBAIExemptCode.EXEMPT_CODE_E6:
          return translate.instant("dpos.exempt-code.code.e6");
      default:
          return translate.instant("dpos.exempt-code.code.none");
    }
  }

  public override getTaxExemptCodes(): TaxExemptCode[]{
    const exemptCodes: TaxExemptCode[] = [];
    exemptCodes.push(new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_E1));
    exemptCodes.push(new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_E2));
    exemptCodes.push(new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_E3));
    exemptCodes.push(new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_E4));
    exemptCodes.push(new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_E5));
    exemptCodes.push(new TBAIExemptCode(TBAIExemptCode.EXEMPT_CODE_E6));
    return exemptCodes;
  }
}

export class VerifactuExemptCode extends TaxExemptCode {

  static readonly EXEMPT_CODE_E1 = "E1";
  static readonly EXEMPT_CODE_E2 = "E2";
  static readonly EXEMPT_CODE_E3 = "E3";
  static readonly EXEMPT_CODE_E4 = "E4";
  static readonly EXEMPT_CODE_E5 = "E5";
  static readonly EXEMPT_CODE_E6 = "E6";
  static readonly EXEMPT_CODE_NONE = '';
  
  constructor (code: string) {
    super(code);
    this.type = TaxExemptCode.TYPE_VERIFACTU;
  }

  public override getTaxExemptCode(id: string): TaxExemptCode {
    switch (id.trim()) {
      case VerifactuExemptCode.EXEMPT_CODE_E1:
      case VerifactuExemptCode.EXEMPT_CODE_E2:
      case VerifactuExemptCode.EXEMPT_CODE_E3:
      case VerifactuExemptCode.EXEMPT_CODE_E4:
      case VerifactuExemptCode.EXEMPT_CODE_E5:
      case VerifactuExemptCode.EXEMPT_CODE_E6:
        return new VerifactuExemptCode(id);
      default:
        return new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_NONE);
    }
  }

  public override getTaxExemptCodeName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case VerifactuExemptCode.EXEMPT_CODE_E1:
          return translate.instant("dpos.exempt-code.code.e1");
      case VerifactuExemptCode.EXEMPT_CODE_E2:
          return translate.instant("dpos.exempt-code.code.e2");
      case VerifactuExemptCode.EXEMPT_CODE_E3:
          return translate.instant("dpos.exempt-code.code.e3");
      case VerifactuExemptCode.EXEMPT_CODE_E4:
          return translate.instant("dpos.exempt-code.code.e4");
      case VerifactuExemptCode.EXEMPT_CODE_E5:
          return translate.instant("dpos.exempt-code.code.e5");
      case VerifactuExemptCode.EXEMPT_CODE_E6:
          return translate.instant("dpos.exempt-code.code.e6");
      default:
          return translate.instant("dpos.exempt-code.code.none");
    }
  }

  public override getTaxExemptCodes(): TaxExemptCode[]{
    const exemptCodes: TaxExemptCode[] = [];
    exemptCodes.push(new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_E1));
    exemptCodes.push(new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_E2));
    exemptCodes.push(new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_E3));
    exemptCodes.push(new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_E4));
    exemptCodes.push(new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_E5));
    exemptCodes.push(new VerifactuExemptCode(VerifactuExemptCode.EXEMPT_CODE_E6));
    return exemptCodes;
  }
}

export class TBAINoApplyCode extends TaxExemptCode {

  static readonly NO_APPLY_CODE_OT = "OT";
  static readonly NO_APPLY_CODE_RL = "RL";
  static readonly NO_APPLY_CODE_VT = "VT";
  static readonly NO_APPLY_CODE_IE = "IE";
  static readonly NO_APPLY_CODE_NONE = '';
  
  constructor (code: string) {
    super(code);
    this.type = TaxExemptCode.TYPE_TBAI;
  }

  public override getTaxExemptCode(id: string): TaxExemptCode {
    switch (id.trim()) {
      case TBAINoApplyCode.NO_APPLY_CODE_OT:
      case TBAINoApplyCode.NO_APPLY_CODE_RL:
      case TBAINoApplyCode.NO_APPLY_CODE_VT:
      case TBAINoApplyCode.NO_APPLY_CODE_IE:
        return new TBAINoApplyCode(id);
      default:
        return new TBAINoApplyCode(TBAINoApplyCode.NO_APPLY_CODE_NONE);
    }
  }

  public override getTaxExemptCodeName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case TBAINoApplyCode.NO_APPLY_CODE_OT:
          return translate.instant("dpos.exempt-code.code.e1");
      case TBAINoApplyCode.NO_APPLY_CODE_RL:
          return translate.instant("dpos.exempt-code.code.e2");
      case TBAINoApplyCode.NO_APPLY_CODE_VT:
          return translate.instant("dpos.exempt-code.code.e3");
      case TBAINoApplyCode.NO_APPLY_CODE_IE:
          return translate.instant("dpos.exempt-code.code.e4");
      default:
          return translate.instant("dpos.exempt-code.code.none");
    }
  }

  public override getTaxExemptCodes(): TaxExemptCode[]{
    const noApplyCodes: TaxExemptCode[] = [];
    noApplyCodes.push(new TBAINoApplyCode(TBAINoApplyCode.NO_APPLY_CODE_OT));
    noApplyCodes.push(new TBAINoApplyCode(TBAINoApplyCode.NO_APPLY_CODE_RL));
    noApplyCodes.push(new TBAINoApplyCode(TBAINoApplyCode.NO_APPLY_CODE_VT));
    noApplyCodes.push(new TBAINoApplyCode(TBAINoApplyCode.NO_APPLY_CODE_IE));
    return noApplyCodes;
  }
}

export class VerifactuNoApplyCode extends TaxExemptCode {

  static readonly NO_APPLY_CODE_N1 = "N1";
  static readonly NO_APPLY_CODE_N2 = "N2";
  static readonly NO_APPLY_CODE_NONE = '';
  
  constructor (code: string) {
    super(code);
    this.type = TaxExemptCode.TYPE_VERIFACTU;
  }

  public override getTaxExemptCode(id: string): TaxExemptCode {
    switch (id.trim()) {
      case VerifactuNoApplyCode.NO_APPLY_CODE_N1:
      case VerifactuNoApplyCode.NO_APPLY_CODE_N2:
        return new VerifactuNoApplyCode(id);
      default:
        return new VerifactuNoApplyCode(VerifactuNoApplyCode.NO_APPLY_CODE_NONE);
    }
  }

  public override getTaxExemptCodeName(codeTaxRegimen: string, translate: TranslateService): string {
    switch (codeTaxRegimen) {
      case VerifactuNoApplyCode.NO_APPLY_CODE_N1:
          return translate.instant("dpos.exempt-code.code.e1");
      case VerifactuNoApplyCode.NO_APPLY_CODE_N2:
          return translate.instant("dpos.exempt-code.code.e2");
      default:
          return translate.instant("dpos.exempt-code.code.none");
    }
  }

  public override getTaxExemptCodes(): TaxExemptCode[]{
    const noApplyCodes: TaxExemptCode[] = [];
    noApplyCodes.push(new VerifactuNoApplyCode(VerifactuNoApplyCode.NO_APPLY_CODE_N1));
    noApplyCodes.push(new VerifactuNoApplyCode(VerifactuNoApplyCode.NO_APPLY_CODE_N2));
    return noApplyCodes;
  }
}