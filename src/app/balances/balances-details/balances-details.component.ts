import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data, Router, Routes } from '@angular/router';
import { BaseComponent } from 'src/app/common/base/base.component';
import { DataServices } from '../data.services';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'QSC-balances-details',
  templateUrl: './balances-details.component.html',
  styleUrls: ['./balances-details.component.css']
})
export class BalancesDetailsComponent extends BaseComponent implements OnInit{

  balances : any ={};

  nPage:number=1;
  nRecords:number;
  itemTypeTax = 1;
  itemTypeTax2 = 2;
  itemTypeTax3 = 3;

  loadCompleted: boolean = false;
  element = true;

  balancesId:string;
  index:any;

  url: any = 'https://quickshopv4.diusframi.tech:39443/api/balances/';

  constructor(public override router: Router,private route:ActivatedRoute ,private qsacess: DataServices, private httpClient: HttpClient) {
      super(router);

      this.index =this.route.snapshot.params['id'];
      this.qsacess.loadData(this.url+this.index).subscribe(balancesData => {
      this.balances = balancesData;

      this.balances.impuestos = this.itemType(this.balances.BalanceLines);
      this.balances.impuestos2 = this.itemType2(this.balances.BalanceLines);
      this.balances.impuestos3 = this.itemType3(this.balances.BalanceLines);
      
      this.loadCompleted = true;
    });
  }

  itemType(arr :any[]){
    return arr.filter(item=> item.ItemType === this.itemTypeTax);
  }
  itemType2(arr :any[]){
    return arr.filter(item=> item.ItemType === this.itemTypeTax2);
  }
  itemType3(arr :any[]){
    return arr.filter(item=> item.ItemType === this.itemTypeTax3);
  }
  getDecimal(x :any){
    x = (x /100).toFixed(2).replace(".", ",")
    return x 
  }
}


 
 
