import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router, Routes } from '@angular/router';
import { BaseComponent } from 'src/app/common/base/base.component';
import { ClientServiceService } from '../client.service.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-edit-client',
  templateUrl: './edit-client.component.html',
  styleUrls: ['./edit-client.component.css']
})
export class EditClientComponent extends BaseComponent implements OnInit{

  clients : any ={};
  clientsId:string;
  index:any;
  
  nPage:number=1;
  nRecords:number;

  loadCompleted: boolean = false;
  element = true;



  url: any = 'https://quickshopv4.diusframi.tech:39443/api/customers/';

   constructor( public override router: Router,private route:ActivatedRoute ,private qsacess1: ClientServiceService, private httpClient: HttpClient) {
       super(router);

       this.index =this.route.snapshot.params['id'];
       this.qsacess1.loadData(this.url+this.index).subscribe(clientsData => {
       this.clients = clientsData;
       this.loadCompleted = true;
     });
   }
}