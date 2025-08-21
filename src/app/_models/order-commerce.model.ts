/**
 * @class OrderCommerce
 * @description
 * Representa la información de un comercio relacionado con una venta,
 * incluyendo datos de identificación, contacto y dirección.
 */
export class OrderCommerce {
  
  orderCommerceId: string;
  name: string;
  tradeName: string;
  nif: string;
  address: string;
  postalCode: number;
  city: string;
  state: string;
  country: string;
  phone: number;
  email: string;
  commerceNumber: number;
}
