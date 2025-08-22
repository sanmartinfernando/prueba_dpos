import { inject, Injectable } from '@angular/core';
import { OrderInfo } from '../_models/order-info.model';
import { Balance } from '../_models/balance.model';
import { SalesReport, SalesReportAggregations } from '../_models/sales-report.model';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order } from '../_models/order.model';
import { Customer } from '../_models/customer.model';
import { Tax } from '../_models/tax.model';
import { Product } from '../_models/product.model';

/**
 * @class DownloadCsvService
 * @description
 * Servicio para la generación y descarga de archivos CSV a partir de datos de ventas, cierres de caja, productos,
 * clientes, impuestos y otros informes.
 */
@Injectable({ providedIn: 'root' })
export class DownloadCsvService {

  private datePipe = inject(DatePipe);
  private translate = inject(TranslateService);
  private currencyPipe = inject(CurrencyPipe);

  public currentLang: string;

  constructor() {
    this.currentLang = this.translate.currentLang || 'es';
  }

  /**
   * Genera y descarga un archivo CSV con datos de ventas.
   * 
   * @param sales Información de ventas.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadSalesFile(sales: OrderInfo, filename = 'data', language: string) {
    if (!sales) return;
    const headersES = ['Documento', 'Tipo', 'Fecha', 'Terminal', 'Subtotal', 'Descuentos', 'Base Imponible', 'IVA', 'Total'];
    const headersCAT = ['Document', 'Tipus', 'Data', 'Terminal', 'Subtotal', 'Descomptes', 'Base Imponible', 'IVA', 'Total'];
    const headersEU = ['Dokumentua', 'Guy', 'Data', 'Terminala', 'Azpitotala', 'Deskontuak', 'Zerga Oinarria', 'BEZa', 'Guztira'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['reference', 'type', 'createdAt', 'terminalNumber', 'subTotal', 'totalDiscount', 'subTotalTaxes', 'totalTaxes', 'total'];
    const csvData = this.convertSalesToCSV(sales.data, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con datos de cierres de caja.
   * 
   * @param balances Lista de cierres de caja.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadBalancesFile(balances: Balance[], filename = 'data', language: string) {
    if (!balances) return;
    const headersES = ['Documento', 'Terminal', 'Desde', 'Hasta', 'Operaciones', 'Descuadre(€)', 'Total'];
    const headersCAT = ['Document', 'Terminal', 'Des de', 'Fins', 'Operacions', 'Desquadrament(€)', 'Total'];
    const headersEU = ['Dokumentua', 'Terminala', 'Bertatik', 'Arte', 'Eragiketak', 'Okerrak(€)', 'Guztira'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['reference', 'terminalNumber', 'startedAt', 'finishedAt', 'salesCount', 'autoCashRecount', 'total'];
    const csvData = this.convertBalancesToCSV(balances, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con información de arqueo X.
   * 
   * @param arqueoX Balance con datos de arqueos.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadArqueoXFile(arqueoX: Balance, filename = 'data', language: string) {
    if (!arqueoX) return;
    const headersES = ['Impuesto', 'Base', 'Cuota', 'Total'];
    const headersCAT = ['Impost', 'Base', 'Quota', 'Total'];
    const headersEU = ['Zerga', 'Oinarria', 'Partekatu', 'Guztira'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['name', 'base', 'tax', 'total'];
    const csvData = this.convertArqueoXToCSV(arqueoX, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con un informe de ventas agregado.
   * 
   * @param salesReport Informe de ventas.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadSalesReportFile(salesReport: SalesReport, filename = 'data', language: string) {
    if (!salesReport) return;
    const headersES = ['Producto', 'PVP (IVA INC.)', 'Ud. Vendidas', 'Total'];
    const headersCAT = ['Producte', 'PVP (IVA INC.)', 'U. Venudes', 'Total'];
    const headersEU = ['Produktua', 'RRP (BEZa barne)', 'Saldu duzu', 'Guztira'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['aggregations.product', 'currency', 'aggregations.units', 'aggregations.total'];
    const csvData = this.convertSalesReportToCSV(salesReport, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con métodos de pago registrados en un cierre de caja.
   * 
   * @param arqueoX Balance con métodos de pago.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadPaymentMethodsFile(arqueoX: Balance, filename = 'data', language: string) {
    if (!arqueoX) return;
    const headersES = ['Método de Pago', '% sobre importe total', 'Total'];
    const headersCAT = ['Mètode de Pagagament', '% sobre import total', 'Total'];
    const headersEU = ['Ordainketa-metodoa', 'zenbateko osoaren %', 'Guztira'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['itemName', 'percentage', 'total'];
    const csvData = this.convertBalanceLinesToCSV(arqueoX, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con datos de clientes.
   * 
   * @param customers Lista de clientes.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadCustomersFile(customers: Customer[], filename = 'data', language: string) {
    if (!customers) return;
    const headersES = ['NIF', 'Nombre', 'Teléfono', 'Email'];
    const headersCAT = ['NIF', 'Nom', 'Telèfon', 'Email'];
    const headersEU = ['IFZ', 'Izena', 'Telefonoa', 'Posta elektronikoa'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['nif', 'name', 'phone', 'email'];
    const csvData = this.convertCustomersToCSV(customers, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con datos de productos.
   * 
   * @param products Lista de productos.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadProductsFile(products: Product[], filename = 'data', language: string) {
    if (!products) return;
    const headersES = ['Nombre', 'Precio', 'Stock'];
    const headersCAT = ['Nom', 'Preu', 'Stock'];
    const headersEU = ['Izena', 'Prezioa', 'Stocka'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['name', 'price', 'stock'];
    const csvData = this.convertProductsToCSV(products, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Genera y descarga un archivo CSV con datos de impuestos.
   * 
   * @param taxes Lista de impuestos.
   * @param filename Nombre del archivo a descargar.
   * @param language Idioma de los encabezados.
   */
  public downloadTaxesFile(taxes: Tax[], filename = 'data', language: string) {
    if (!taxes) return;
    const headersES = ['ID', 'Nombre', 'Valor'];
    const headersCAT = ['ID', 'Nom', 'Valor'];
    const headersEU = ['IFZ', 'Izena', 'Balio'];
    let headers: string[] = headersES;
    if (language === 'es') {
      headers = headersES;
    } else if (language === 'eu') {
      headers = headersEU;
    } else if (language === 'cat') {
      headers = headersCAT;
    }
    const fields = ['id', 'value', 'name'];
    const csvData = this.convertTaxesToCSV(taxes, fields, headers);
    const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    const dwldLink = document.createElement("a");
    const url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + " " + this.formatDate(Date.now()) + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  /**
   * Convierte datos de ventas a formato CSV.
   * 
   * @param orders Lista de ventas.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertSalesToCSV(orders: Order[], fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const order of orders) {
      let line = "";
      line += (line ? ';' : '') + (order.reference || '');
      if (order.type === 2) {
        line += (line ? ';' : '') + (this.translate.instant('dpos.sales.operation.refund.label') || '');
      } else if (order.type === 5) {
        line += (line ? ';' : '') + (this.translate.instant('dpos.sales.operation.rectification.label') || '');
      } else {
        line += (line ? ';' : '') + (this.translate.instant('dpos.sales.operation.order.label') || '');
      }
      line += (line ? ';' : '') + (this.datePipe.transform(order.createdAt, 'dd/MM/yyyy HH:mm') || '');
      line += (line ? ';' : '') + (order.terminalNumber || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.subTotal / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.totalDiscount / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.subTotalTaxes / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.totalTaxes / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.total / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Convierte datos de cierres de caja a formato CSV.
   * 
   * @param balances Lista de cierres de caja.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertBalancesToCSV(balances: Balance[], fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const balance of balances) {
      let line = "";
      line += (line ? ';' : '') + (balance.reference || '');
      line += (line ? ';' : '') + (balance.terminalNumber || '');
      line += (line ? ';' : '') + (this.datePipe.transform(balance.startedAt, 'dd/MM/yyyy HH:mm') || '');
      line += (line ? ';' : '') + (this.datePipe.transform(balance.finishedAt, 'dd/MM/yyyy HH:mm') || '');
      line += (line ? ';' : '') + ((balance.salesCount + balance.refundsCount + balance.rectifyCount) || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform((Math.abs(balance.manualCashRecount) - Math.abs(balance.autoCashRecount)) / (Math.pow(10, balance.decimals)), 'EUR', '€') || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(balance.total / (Math.pow(10, balance.decimals)), 'EUR', '€') || '');
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Convierte datos de arqueos a formato CSV.
   * 
   * @param balance Arqueo con líneas de impuestos.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertArqueoXToCSV(balance: Balance, fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const taxes of balance.balanceLines) {
      let line = "";
      if (taxes.itemType === 1 && taxes.itemValue !== -1) {
        line += (line ? ';' : '') + (taxes.itemName || '');
        line += (line ? ';' : '') + (this.currencyPipe.transform(taxes.base / Math.pow(10, taxes.decimals), 'EUR', '€') || '');
        line += (line ? ';' : '') + (this.currencyPipe.transform(taxes.tax / Math.pow(10, taxes.decimals), 'EUR', '€') || '');
        line += (line ? ';' : '') + (this.currencyPipe.transform(taxes.total / Math.pow(10, taxes.decimals), 'EUR', '€') || '');
        str += line + '\r\n';
      }
    }
    return str;
  }

  /**
   * Convierte un informe de ventas a formato CSV.
   * 
   * @param salesReport Informe de ventas.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertSalesReportToCSV(salesReport: SalesReport, fields: string[], headers: string[]) {
    const products: SalesReportAggregations[] = Object.values(salesReport.aggregations);
    let str = headers.join(';') + '\r\n';
    for (const product of products) {
      let line = "";
      line += (line ? ';' : '') + (product.product || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(product.total / 100000000 / ((product.units ?? 2) / 1000), 'EUR', '€') || '');
      line += (line ? ';' : '') + ((product.units ?? 2) / 1000 || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(product.total / 100000000, 'EUR', '€') || '');
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Convierte métodos de pago a formato CSV.
   * 
   * @param balance Balance con métodos de pago.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertBalanceLinesToCSV(balance: Balance, fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const paymentMethod of balance.balanceLines) {
      let line = "";
      if (paymentMethod.itemType === 2) {
        line += (line ? ';' : '') + (paymentMethod.itemName || '');
        line += (line ? ';' : '') + (paymentMethod.percentage + " %" || '');
        line += (line ? ';' : '') + (this.currencyPipe.transform(paymentMethod.total / Math.pow(10, paymentMethod.decimals), 'EUR', '€') || '');
        str += line + '\r\n';
      }
    }
    return str;
  }

  /**
   * Convierte datos de clientes a formato CSV.
   * 
   * @param customers Lista de clientes.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertCustomersToCSV(customers: Customer[], fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const customer of customers) {
      let line = "";
      line += (line ? ';' : '') + (customer.identityDocument || '');
      line += (line ? ';' : '') + (customer.name || '');
      line += (line ? ';' : '') + (customer.phone || '');
      line += (line ? ';' : '') + (customer.email || '');
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Convierte datos de productos a formato CSV.
   * 
   * @param products Lista de productos.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertProductsToCSV(products: Product[], fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const product of products) {
      let line = "";
      line += (line ? ';' : '') + (product.name || '');
      line += (line ? ';' : '') + (this.currencyPipe.transform(product.price / (Math.pow(10, product.price)), 'EUR', '€') || '');
      line += (line ? ';' : '') + (product.stock || '');
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Convierte datos de impuestos a formato CSV.
   * 
   * @param taxes Lista de impuestos.
   * @param fields Campos a incluir.
   * @param headers Encabezados del archivo.
   */
  public convertTaxesToCSV(taxes: Tax[], fields: string[], headers: string[]) {
    let str = headers.join(';') + '\r\n';
    for (const tax of taxes) {
      let line = "";
      line += (line ? ';' : '') + (tax.id || '');
      line += (line ? ';' : '') + ((tax.value / 100).toFixed(2) + ' %' || '');
      line += (line ? ';' : '') + (tax.name || '');
      str += line + '\r\n';
    }
    return str;
  }

  /**
   * Formatea una fecha en formato dd-MM-yyyy.
   * 
   * @param timestamp Fecha en timestamp.
   * @returns Fecha formateada.
   */
  private formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
}