import { StorageService } from 'src/app/_services/storage.service';
import { EncryptionService } from './../../_services/encryption.service';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SalesInfoDetailId } from 'src/app/_models/SalesDetailId.model';
import { Salesdetailid } from 'src/app/_services/salesdetailid.service';

@Component({
  selector: 'DPOSW-details',
  templateUrl: './details.component.html',
})

export class DetailsComponent implements OnInit {

    /*---------Propiedades--------*/

    ticket:SalesInfoDetailId;
    orderId:string;
    loadCompleted:boolean = false;
    isLoggedIn: boolean = false;

    constructor(private paramsUrl:ActivatedRoute, private router:Router, private http:HttpClient,
                private datePipe: DatePipe, private Salesdetailid:Salesdetailid, private EncryptionService:EncryptionService,
                private StorageService: StorageService){
    }

    ngOnInit(): void {
        this.StorageService.loggedin$.subscribe(loggedin => this.isLoggedIn=loggedin );
        console.log(this.isLoggedIn)
        let iddecode = this.EncryptionService.decode(this.paramsUrl.snapshot.params['id']);
        this.orderId = this.EncryptionService.decrypt(iddecode);
        console.log(this.orderId)
        this.Salesdetailid.GetSalesDetail(this.orderId).subscribe(ticketVentas=>{
          console.log(ticketVentas);
          this.ticket=ticketVentas;
          console.log(this.ticket);
          this.loadCompleted = true;
      });
    }

/*----------Funciones---------*/

    //Calcular valores totales de Orderlines.Subtotal y OrderTaxes.Base
    calculateTotal(orders: any[], propertyName:string): number{
        let total = 0;

        for (let calculate of orders) {
        total += calculate[propertyName] / 100;
        }

        return total;
    }


}

