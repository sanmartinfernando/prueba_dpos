export class Customer {

  static readonly NO_ID = "-1";
  static readonly ID_TYPE_NATIONAL = "00";
  static readonly ID_TYPE_OTHER_NATIONAL = "02";
  static readonly ID_TYPE_OTHER_PASSPORT = "03";
  static readonly ID_TYPE_OTHER_COUNTRY = "04";
  static readonly ID_TYPE_OTHER_RESIDENCE = "05";
  static readonly ID_TYPE_OTHER_OTHER = "06";
  
  id: string;
  name: string;
  idType: string;
  nif: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  email: string;
  phone: string;
  selected:boolean = false;
}
