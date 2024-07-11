export class SalesInfo {
  size: number;
  offset: number;
  total: number;
  data: [
    {
      orderId: string;
      currency: string;
      reference: string;
      type: number;
      status: number;
      subTotal: number;
      subTotalTaxes: number;
      taxesDiscount: number;
      total: number;
      totalDiscount: number;
      totalTaxes: number;
      decimals: number;
      createdAt: number;
      updatedAt: number;
      finishedAt: number;
      itemsCount: number;
      parentOrderId: string;
      indexedAt: string;
      orderLines: [
        {
          orderLineId: string;
          rowNumber: number;
          productId: number;
          productName: string;
          productUnitMeasurement: number;
          quantity: number;
          unitPrice: number;
          amount: number;
          taxAmount: number;
          taxValue: number;
          taxExemptCode: string;
          taxName: string;
          subTotal: number;
          subTotalTaxes: number;
          total: number;
          totalTaxes: number;
          taxesDiscount: number;
          totalDiscount: number;
          orderLineParentId: string;
          productTaxRegimen: string;
          productEpigraph: string;
          orderModifiers: [];
          noticeKitchen: string;
          decimals: number;
        }
      ];
      orderTaxes: [
        {
          orderTaxId: string;
          currency: string;
          name: string;
          value: number;
          base: number;
          total: number;
          decimals: number;
          taxExemptCode: string;
          taxRegimen: string;
        }
      ];
      orderPayments: [
        {
          orderPaymentId: string;
          amount: number;
          income: number;
          change: number;
          currency: null;
          name: string;
          paymentDate: string;
          transactionId: string;
          transactionStatus: string;
          authorizationId: string;
          cardBrand: string;
          cardPan: string;
          type: number;
          decimals: number;
          createdAt: number;
          updatedAt: number;
        }
      ];
      orderCommerce: {
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
      };
      orderCustomer: string;
      orderTicketBai: string;
      orderDiscounts: string;
      childs: string;
      hash: string;
      terminalUid: string;
      terminalNumber: number;
      appVersion: string;
      reseller: string;
    }
  ]
}
