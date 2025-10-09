import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncryptionService } from './../../_services/encryption.service';
import { DownloadPDFService } from 'src/app/_services/download-pdf.service';
import { OrdersService } from '../../_services/orders.service';
import { SessionService } from 'src/app/_services/session.service';
import { ThemeService } from 'src/app/_services/theme.service';
import { UIStateService } from 'src/app/_services/ui-state.service';

import { Order } from 'src/app/_models/order.model';
import { TranslateService } from '@ngx-translate/core';

/**
 * @class DetailsComponent
 * @description
 * Componente que muestra los detalles de una venta,
 * incluyendo cálculos de totales, información fiscal y descarga en PDF.
 */
@Component({
  selector: 'app-dpos-details',
  templateUrl: './details.component.html',
})
export class DetailsComponent implements OnInit {

  private activatedRoute = inject(ActivatedRoute);
  private downloadPDFService = inject(DownloadPDFService);
  private ordersService = inject(OrdersService);
  private encryptionService = inject(EncryptionService);
  private sessionService = inject(SessionService);
  private themeService = inject(ThemeService);
  private uiStateService = inject(UIStateService);
  private translate = inject(TranslateService);

  public ticket: Order;
  public orderId: string;
  public loadCompleted = false;
  public isLoggedIn = true;
  public Math = Math;
  public operationsTicketBai: string[];
  public operationsVerifactu: string[];
  public totalBase: number;

  modalTitle = '';
  modalMessage = '';
  showModal = false;

  constructor() {
    this.themeService.loadTheme(this.sessionService.getItem(SessionService.RESELLER_NAME));
    this.uiStateService.setFormSelectEnabled(false);
  }

  /**
   * Inicializa el componente, cargando la información de la venta según su ID.
   */
  ngOnInit(): void {
    const iddecode = this.encryptionService.decode(
      this.activatedRoute.snapshot.params['id']
    );
    this.orderId = this.encryptionService.decrypt(iddecode);

    this.ordersService.getOrderDetail(this.orderId).subscribe({
      next: (ticketOperaciones) => {
        this.ticket = ticketOperaciones;
        this.operationsTicketBai = [];
        if (this.ticket.orderTicketBai) {
          this.operationsTicketBai[0] = this.ticket.orderTicketBai.ticketBaiId;
          this.operationsTicketBai[1] = this.ticket.orderTicketBai.url;
        }
        this.operationsVerifactu = [];
        if (this.ticket.orderVerifactu) {
          this.operationsVerifactu[0] = this.ticket.orderVerifactu.url;
          this.operationsVerifactu[1] = this.ticket.orderVerifactu.url;
        }
        this.totalBase = 0;
        for (const tax of this.ticket.orderTaxes) {
          this.totalBase += tax.base / Math.pow(10, tax.decimals);
        }
        this.loadCompleted = true;
      },
      error: (error) => {
        this.openModal(this.translate.instant('dpos.error.msg.general'), this.translate.instant('dpos.error.msg.service.order.details'));
        if (error.status === 401 || error.status === 500) {
          this.loadCompleted = true;
        }
      }
    });
  }

  /**
   * Descarga el pedido actual en formato PDF.
   */
  public downloadPDF(): void {
    this.downloadPDFService.downloadOrdersFile(this.orderId);
  }

  /**
   * Abre el modal de mensajes estableciendo el título y el mensaje.
   *
   * @param title   Texto que se mostrará como título del modal.
   * @param message Texto que se mostrará como contenido del modal.
   */
  public openModal(title: string, message: string) {
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }
  
  /**
   * Cierra el modal de mensajes.
   */
  public closeModal() {
    this.showModal = false;
  }
}
