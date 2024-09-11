import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../../_services/encryption.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SalesInfoDetailId } from 'src/app/_models/SalesDetailId.model';
import { Salesdetailid } from 'src/app/_services/salesdetailid.service';
import { DownloadPDFService } from 'src/app/_services/downloadpdf.service';



@Component({
  selector: 'DPOSW-details',
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit {
  /*---------Propiedades--------*/

  ticket: SalesInfoDetailId;
  orderId: string;
  loadCompleted: boolean = false;
  isLoggedIn: boolean = true;
  Math = Math;
  salesTicketBai;

  //QR parametros


  constructor(
    private paramsUrl: ActivatedRoute,
    private DownloadPDFService: DownloadPDFService,
    private Salesdetailid: Salesdetailid,
    private EncryptionService: EncryptionService,
    private StorageService: StorageService
  ) {}

  ngOnInit(): void {
    let iddecode = this.EncryptionService.decode(
      this.paramsUrl.snapshot.params['id']
    );
    this.orderId = this.EncryptionService.decrypt(iddecode);
    this.Salesdetailid.GetSalesDetail(this.orderId).subscribe(
      (ticketVentas) => {
        this.ticket = ticketVentas;
        this.salesTicketBai = [];
        if (this.ticket.orderTicketBai != null) {
          if (
            this.ticket.orderTicketBai.status == '00' &&
            this.ticket.orderTicketBai.warns.length <= 0
          ) {
            this.salesTicketBai[0] = this.ticket.orderTicketBai.ticketBaiId;
            this.salesTicketBai[1] = this.ticket.orderTicketBai.url;
          }
        }
        this.loadCompleted = true;
      } ,
      (error) => {
        if (error.status == 401) {
          this.isLoggedIn = false;
          this.StorageService.clean();
        };
      }
    );
  }

  /*----------Funciones---------*/

  //Calcular valores totales de Orderlines.Subtotal y OrderTaxes.Base
  calculateTotal(orders: any[], propertyName: string): number {
    let total = 0;

    for (let calculate of orders) {
      total += calculate[propertyName] / 100;
    }

    return total;
  }

  donwloadPDF(){
    this.DownloadPDFService.downloadFileOrders(this.orderId)
  }


}
