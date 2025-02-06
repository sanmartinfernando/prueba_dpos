import { Injectable } from '@angular/core';
import { OrderInfo } from '../_models/order-info.model';
import { BalanceInfo } from '../_models/balance-info.model';
import { Balance } from '../_models/balance.model';
import { SalesReport } from '../_models/sales-report.model';

@Injectable({
  providedIn: 'root'
})
export class CsvdownloadService {

  constructor() { }
  
  downloadSalesFile(sales: OrderInfo, filename = 'data', language) {
    
    let headers;

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
    
    //if(language === 'es-ES'){
        headers = headersES;
    //} else if (language === 'es-EU'){
    //    headers = headersEU;
    //}

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
    let csvData = this.convertToCSV(sales.data, fields, headers);
    
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

  downloadBalancesFile(balances: Balance[], filename = 'data', language) {
    
    let headers;

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

    const headersEU = [
        'Dokumentua',
        'Terminala',
        'Bertatik',
        'Arte',
        'Eragiketak',
        'Okerrak (€)',
        'Guztira'
    ];
    
    //if(language === 'es-ES'){
        headers = headersES;
    //} else if (language === 'es-EU'){
    //    headers = headersEU;
    //}

    const fields = [
        'reference',
        'terminalNumber',
        'startedAt',
        'finishedAt',
        'salesCount', //TODO: balance.salesCount + balance.refundsCount + balance.rectifyCount
        'autoCashRecount', //TODO: Math.abs(this.balances.data[i].manualCashRecount)-Math.abs(this.balances.data[i].autoCashRecount)
        'total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertToCSV(balances, fields, headers);
    
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

  downloadArqueoXFile(arqueoX: Balance, filename = 'data', language) {
    
    let headers;

    // Encabezados en ambos idiomas
    const headersES = [
      'Impuesto',
      'Valor (%)',
      'Base',
      'Cuota'
    ];

    const headersEU = [
        'Zerga',
        'Merezi (%)',
        'Oinarria',
        'Partekatu'
    ];
    
    //if(language === 'es-ES'){
        headers = headersES;
    //} else if (language === 'es-EU'){
    //    headers = headersEU;
    //}

    const fields = [
        'reference', //TODO
        'sales', //TODO
        'refunds', //TODO
        'total' //TODO
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertToCSV(arqueoX, fields, headers);
    
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

  downloadSalesReportFile(salesReport: SalesReport, filename = 'data', language) {
    
    let headers;

    // Encabezados en ambos idiomas
    const headersES = [
      'Producto',
      'PVP (IVA INC.)',
      'Ud. Vendidas',
      'Total'
    ];

    const headersEU = [
        'Produktua',
        'RRP (BEZa barne)',
        'Saldu duzu',
        'Guztira'
    ];
    
    //if(language === 'es-ES'){
        headers = headersES;
    //} else if (language === 'es-EU'){
    //    headers = headersEU;
    //}

    const fields = [
        'aggregations.product',
        'currency',
        'aggregations.units',
        'aggregations.total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertToCSV(salesReport, fields, headers);
    
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

  downloadPaymentMethodsFile(arqueoX: Balance, filename = 'data', language) {
    
    let headers;

    // Encabezados en ambos idiomas
    const headersES = [
      'Método de Pago',
      '% sobre importe total',
      'Total'
    ];

    const headersEU = [
        'Ordainketa-metodoa',
        'zenbateko osoaren %',
        'Guztira'
    ];
    
    //if(language === 'es-ES'){
        headers = headersES;
    //} else if (language === 'es-EU'){
    //    headers = headersEU;
    //}

    const fields = [
        'itemName',
        'percentage',
        'total'
    ];

    // Convertir a CSV con solo los datos y encabezados específicos
    let csvData = this.convertToCSV(arqueoX.balanceLines, fields, headers);
    
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

  convertToCSV(objArray, fields, headers) {
    let array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
    let str = headers.join(';') + '\r\n'; 

    for (let i = 0; i < array.length; i++) {
        let line = '';
        for (let j = 0; j < fields.length; j++) {
            let field = fields[j];
            line += (line ? ';' : '') + (array[i][field] || ''); // Agregar dato o vacío
        }
        str += line + '\r\n';
    }
    return str;
  }
}