import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SalesService } from '../sales.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'QSC-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})

export class DetailsComponent implements OnInit {

    /*---------Propiedades--------*/

    ticket:any = [];
    orderId:string;
    loadCompleted:boolean = false;

    constructor(private paramsUrl:ActivatedRoute, private router:Router, private http:HttpClient,private salesService:SalesService,
                private datePipe: DatePipe){ 
    }

    ngOnInit(): void {
        this.orderId = this.paramsUrl.snapshot.params['id'];
        this.showOrderLine().subscribe(ticketVentas=>{
            console.log(ticketVentas);
            this.ticket=ticketVentas;
            this.loadCompleted = true;
        });
    }

/*---------Peticiones a WS------*/

    showOrderLine(){
        return this.http.get("https://quickshopv4.diusframi.tech:39443/api/orders/"+ this.orderId +"");
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

