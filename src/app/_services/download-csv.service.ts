import { Injectable } from '@angular/core';
import { OrderInfo } from '../_models/order-info.model';
import { Balance } from '../_models/balance.model';
import { SalesReport, SalesReportAggregations } from '../_models/sales-report.model';
import { TranslateService } from '@ngx-translate/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Order } from '../_models/order.model';
import { BalanceLine } from '../_models/balance-line.model';

@Injectable({
  providedIn: 'root'
})
export class DownloadCsvService {

  currentLang: string;

  constructor(private datePipe: DatePipe, 
    private translate: TranslateService, 
    private currencyPipe: CurrencyPipe) {
    this.currentLang = this.translate.currentLang || 'es';
   }
  
  public downloadSalesFile(sales: OrderInfo, filename = 'data', language: string) {

    // Encabezados en ambos idiomas
    const headersES = [
      'Documento',
      'Tipo',
      'Fecha',
      'Terminal',
      'Subtotal',
      'Descuentos',
      'Base Imponible',
      'IVA',
      'Total'
    ];

    const headersCAT = [
      'Document',
      'Tipus',
      'Data',
      'Terminal',
      'Subtotal',
      'Descomptes',
      'Base Imponible',
      'IVA',
      'Total'
    ];

    const headersEU = [
        'Dokumentua',
        'Guy',
        'Data',
        'Terminala',
        'Azpitotala',
        'Deskontuak',
        'Zerga Oinarria',
        'BEZa',
        'Guztira'
    ];
    
    let headers: string[] = headersES;

    if(language === 'es'){
        headers = headersES;
    } else if (language === 'eu'){
        headers = headersEU;
    } else if (language === 'cat'){
      headers = headersCAT;
    }

    const fields = [
        'reference',
        'type',
        'createdAt',
        'terminalNumber',
        'subTotal',
        'totalDiscount',
        'subTotalTaxes',
        'totalTaxes',
        'total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertSalesToCSV(sales.data, fields, headers);
    
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  public downloadBalancesFile(balances: Balance[], filename = 'data', language: string) {
    
    // Encabezados en ambos idiomas
    const headersES = [
      'Documento',
      'Terminal',
      'Desde',
      'Hasta',
      'Operaciones',
      'Descuadre(€)',
      'Total'
    ];

    const headersCAT = [
      'Document',
      'Terminal',
      'Des de',
      'Fins',
      'Operacions',
      'Desquadrament(€)',
      'Total'
    ];

    const headersEU = [
        'Dokumentua',
        'Terminala',
        'Bertatik',
        'Arte',
        'Eragiketak',
        'Okerrak(€)',
        'Guztira'
    ];
    
    let headers: string[] = headersES;

    if(language === 'es'){
        headers = headersES;
    } else if (language === 'eu'){
        headers = headersEU;
    } else if (language === 'cat'){
      headers = headersCAT;
    }

    const fields = [
        'reference',
        'terminalNumber',
        'startedAt',
        'finishedAt',
        'salesCount',
        'autoCashRecount',
        'total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertBalancesToCSV(balances, fields, headers);
    
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  public downloadArqueoXFile(arqueoX: Balance, filename = 'data', language: string) {

    // Encabezados en ambos idiomas
    const headersES = [
      'Impuesto',
      'Base',
      'Cuota',
      'Total'
    ];

    const headersCAT = [
      'Impost',
      'Base',
      'Quota',
      'Total'
    ];
    const headersEU = [
        'Zerga',
        'Oinarria',
        'Partekatu',
        'Guztira'
    ];
    
    let headers: string[] = headersES;

    if(language === 'es'){
        headers = headersES;
    } else if (language === 'eu'){
        headers = headersEU;
    } else if (language === 'cat'){
      headers = headersCAT;
    }

    const fields = [
        'name',
        'base',
        'tax',
        'total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertArqueoXToCSV(arqueoX, fields, headers);
    
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  public downloadSalesReportFile(salesReport: SalesReport, filename = 'data', language: string) {

    // Encabezados en ambos idiomas
    const headersES = [
      'Producto',
      'PVP (IVA INC.)',
      'Ud. Vendidas',
      'Total'
    ];

    const headersCAT = [
      'Producte',
      'PVP (IVA INC.)',
      'U. Venudes',
      'Total'
    ];

    const headersEU = [
        'Produktua',
        'RRP (BEZa barne)',
        'Saldu duzu',
        'Guztira'
    ];
    
    let headers: string[] = headersES;

    if(language === 'es'){
        headers = headersES;
    } else if (language === 'eu'){
        headers = headersEU;
    } else if (language === 'cat'){
      headers = headersCAT;
    }

    const fields = [
        'aggregations.product',
        'currency',
        'aggregations.units',
        'aggregations.total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertSalesReportToCSV(salesReport, fields, headers);
    
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  public downloadPaymentMethodsFile(arqueoX: Balance, filename = 'data', language: string) {

    // Encabezados en ambos idiomas
    const headersES = [
      'Método de Pago',
      '% sobre importe total',
      'Total'
    ];

    const headersCAT = [
      'Mètode de Pagagament',
      '% sobre import total',
      'Total'
    ];

    const headersEU = [
        'Ordainketa-metodoa',
        'zenbateko osoaren %',
        'Guztira'
    ];
    
    let headers: string[] = headersES;

    if(language === 'es'){
        headers = headersES;
    } else if (language === 'eu'){
        headers = headersEU;
    } else if (language === 'cat'){
      headers = headersCAT;
    }

    const fields = [
        'itemName',
        'percentage',
        'total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertBalanceLinesToCSV(arqueoX, fields, headers);
    
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  public convertSalesToCSV(orders:Order[], fields:string[], headers: string[]) {

    let str = headers.join(';') + '\r\n'; 
    for (let i = 0; i < orders.length; i++) {
      let order: Order = orders[i]
      let line:string = "";
      //reference
      line += (line ? ';' : '') + (order.reference || '');
      //type
      if(order.type == 2) {
        line += (line ? ';' : '') + (this.translate.instant('dpos.sales.operation.refund.label') || '');
      } else if(order.type == 5) {
        line += (line ? ';' : '') + (this.translate.instant('dpos.sales.operation.rectification.label') || '');
      } else {
        line += (line ? ';' : '') + (this.translate.instant('dpos.sales.operation.order.label') || '');
      }
      //createdAt
      line += (line ? ';' : '') + (this.datePipe.transform(order.createdAt, 'dd/MM/yyyy HH:mm') || '');
      //terminalNumber
      line += (line ? ';' : '') + (order.terminalNumber || '');
      //subTotal
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.subTotal / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      //totalDiscount
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.totalDiscount / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      //subTotalTaxes
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.subTotalTaxes / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      //totalTaxes
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.totalTaxes / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      //total
      line += (line ? ';' : '') + (this.currencyPipe.transform(order.total / (Math.pow(10, order.decimals)), 'EUR', '€') || '');
      
      str += line + '\r\n';
    }
    return str;
  }

  public convertBalancesToCSV(balances:Balance[], fields:string[], headers: string[]) {

    //let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = headers.join(';') + '\r\n'; 
    for (let i = 0; i < balances.length; i++) {
      let balance:Balance = balances[i];
      let line:string = "";
      //reference
      line += (line ? ';' : '') + (balance.reference|| '');
      //terminalNumber
      line += (line ? ';' : '') + (balance.terminalNumber|| '');
      //startedAt
      line += (line ? ';' : '') + (this.datePipe.transform(balance.startedAt, 'dd/MM/yyyy HH:mm') || '');
      //finishedAt 
      line += (line ? ';' : '') + (this.datePipe.transform(balance.finishedAt, 'dd/MM/yyyy HH:mm') || '');
      //salesCount
      line += (line ? ';' : '') + ((balance.salesCount + balance.refundsCount + balance.rectifyCount) || '');
      //autoCashRecount
      line += (line ? ';' : '') + (this.currencyPipe.transform((Math.abs(balance.manualCashRecount)-Math.abs(balance.autoCashRecount)) / (Math.pow(10, balance.decimals)), 'EUR', '€') || '');
      //total
      line += (line ? ';' : '') + (this.currencyPipe.transform(balance.total / (Math.pow(10, balance.decimals)), 'EUR', '€') || '');
      str += line + '\r\n';
    }

    return str;
  }


  public convertArqueoXToCSV(balance:Balance, fields:string[], headers: string[]) {

    let str = headers.join(';') + '\r\n'; 

    for (let i = 0; i < balance.balanceLines.length; i++) {
      let taxes:BalanceLine = balance.balanceLines[i];
      let line:string = "";
      
      if(taxes.itemType == 1) {
        //name
        line += (line ? ';' : '') + (taxes.itemName|| '');
        //base
        line += (line ? ';' : '') + (this.currencyPipe.transform(taxes.base / Math.pow(10, taxes.decimals), 'EUR', '€') || '');
        //tax
        line += (line ? ';' : '') + (this.currencyPipe.transform(taxes.tax / Math.pow(10, taxes.decimals), 'EUR', '€') || '');
        //total 
        line += (line ? ';' : '') + (this.currencyPipe.transform(taxes.total / Math.pow(10, taxes.decimals), 'EUR', '€') || '');
        str += line + '\r\n';
      }
    }

    return str;
  }

  public convertSalesReportToCSV(salesReport:SalesReport, fields:string[], headers: string[]) {
    
    let products:SalesReportAggregations[] = Object.values(salesReport.aggregations);
    let str = headers.join(';') + '\r\n'; 

    for (let i = 0; i < products.length; i++) {
      let product: SalesReportAggregations = products[i];
      let line:string = "";
      
      //aggregations.product
      line += (line ? ';' : '') + (product.product || '');
      //currency
      line += (line ? ';' : '') + (this.currencyPipe.transform(product.total / 100000000 / ( (product.units ?? 2) / 1000), 'EUR', '€') || '');
      //aggregations.units
      line += (line ? ';' : '') + ((product.units ?? 2) / 1000 || '');
      //aggregations.total
      line += (line ? ';' : '') + (this.currencyPipe.transform(product.total / 100000000, 'EUR', '€') || '');
      str += line + '\r\n';
    }

    return str;
  }

  public convertBalanceLinesToCSV(balance:Balance, fields:string[], headers: string[]) {

    let str = headers.join(';') + '\r\n'; 

    for (let i = 0; i < balance.balanceLines.length; i++) {
      let paymentMethod:BalanceLine = balance.balanceLines[i];
      let line:string = "";
      
      if(paymentMethod.itemType == 2) {
        //itemName
        line += (line ? ';' : '') + (paymentMethod.itemName|| '');
        //percentage
        line += (line ? ';' : '') + (paymentMethod.percentage + " %" || '');
        //total 
        line += (line ? ';' : '') + (this.currencyPipe.transform(paymentMethod.total / Math.pow(10, paymentMethod.decimals), 'EUR', '€') || '');
        str += line + '\r\n';
      }
    }

    return str;
  }
}