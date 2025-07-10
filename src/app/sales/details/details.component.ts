import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../../_services/encryption.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from 'src/app/_models/order.model';
import { DownloadPDFService } from 'src/app/_services/download-pdf.service';
import { OrdersService } from '../../_services/orders.service';
import { UIStateService } from 'src/app/_services/ui-state.service';

@Component({
  selector: 'DPOSW-details',
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit {

  ticket: Order;
  orderId: string;
  loadCompleted: boolean = false;
  isLoggedIn: boolean = true;
  Math = Math;
  salesTicketBai;
  salesVerifactu;
  totalBase: number;

  constructor(
    private activatedRoute: ActivatedRoute,
    private downloadPDFService: DownloadPDFService,
    private ordersService: OrdersService,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
    private uiStateService: UIStateService
  ) {
    //Bloqueamos el selector de comercio;
    this.uiStateService.setFormSelectEnabled(false);
  }

  ngOnInit(): void {
    let iddecode = this.encryptionService.decode(
      this.activatedRoute.snapshot.params['id']
    );
    this.orderId = this.encryptionService.decrypt(iddecode);
    this.ordersService.getOrderDetail(this.orderId).subscribe({
      next: (ticketVentas) => {
        this.ticket = ticketVentas;
        this.salesTicketBai = [];
        if (this.ticket.orderTicketBai != null) {
          this.salesTicketBai[0] = this.ticket.orderTicketBai.ticketBaiId;
          this.salesTicketBai[1] = this.ticket.orderTicketBai.url;
        }
        this.salesVerifactu = [];
        if (this.ticket.orderVerifactu != null) {
          this.salesVerifactu[0] = this.ticket.orderVerifactu.url;
          this.salesVerifactu[1] = this.ticket.orderVerifactu.url;
        }
        
        this.totalBase = 0;
        for(let i = 0; i < this.ticket.orderTaxes.length ; i++) {
          this.totalBase += this.ticket.orderTaxes[i].base / Math.pow(10, this.ticket.orderTaxes[i].decimals);
        }

        this.loadCompleted = true;
      } ,
      error: (error) => {
        if (error.status == 401|| error.status == 500) {
          this.loadCompleted = true;
        };
      }
    });
  }

  //Calcular valores totales de Orderlines.Subtotal y OrderTaxes.Base
  calculateTotal(orders: any[], propertyName: string): number {
    let total = 0;
    for (let calculate of orders) {
      total += calculate[propertyName] / 100;
    }
    return total;
  }

  downloadPDF(){
    this.downloadPDFService.downloadOrdersFile(this.orderId)
  }
}
